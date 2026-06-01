
import type { Request, Response } from "express"
import { MatriculaRepository } from "../models/Repository/MatriculaRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { CreateMatriculaDTO, UpdateMatriculaDTO } from "../types"
import { PeriodoMatriculaRepository } from "../models/Repository/PeriodoMatriculaRepository"
import { asyncHandler } from "../utils/asyncHandler"
import { getFileUrl } from "../config/multer"
import { ArchivoRepository } from "../models/Repository/ArchivoRepository"
import { registrarAuditoria } from "../utils/auditoria"
import { TipoArchivoRepository } from "../models/Repository/TipoArchivoRepository"
import path from "path"
import { archivoService } from "../services/archivos.services"
import { EstudianteRepository } from "../models/Repository/EstudianteRepository"
import { MatriculaArchivoRepository } from "../models/Repository/MatriculaArchivoRepository"
import { transaction } from "../config/database"

export class MatriculaController {

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const offset = Number.parseInt(req.query.offset as string) || 0

    const matriculas = await MatriculaRepository.findAll(limit, offset)
    const total = await MatriculaRepository.count()

    res.status(200).json({
      success: true,
      data: matriculas,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) },
    })
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const matricula = await MatriculaRepository.findById(Number(id))

    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    res.status(200).json({ success: true, data: matricula })
  })

  getDetalles = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const id = Number(req.params.id)
    const detalles = await MatriculaRepository.findDetalles(id)

    if (!detalles) throw new AppError("Matrícula no encontrada", 404)

    res.status(200).json({ success: true, data: detalles })
  })

  findMatriculaAndPeriodo = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    let hasMatricula = true

    const estudiante_id = Number(req.params.estudianteId)
    const matricula_id = Number(req.params.matriculaId)

    const isRegister = await MatriculaRepository.findByEstudianteAndPeriodo(estudiante_id, matricula_id)

    if (!isRegister) {
      hasMatricula = false
    }
    res.status(200).json(
      {
        success: hasMatricula,
        message: ""
      }
    )
  })

  getByEstudiante = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const estudiante_id = Number(req.params.estudianteId)

    const matriculas = await MatriculaRepository.findByEstudiante(estudiante_id)

    // Enriquecer cada matrícula con su historial de cambios
    const matriculasConHistorial = await Promise.all(
      matriculas.map(async (m: any) => {
        const historial = await MatriculaRepository.findHistorialByMatricula(m.matricula_id)
        return { ...m, historial }
      })
    )

    res.status(200).json({ success: true, data: matriculasConHistorial })
  })

  getByCurso = asyncHandler(async (req: Request, res: Response) => {
    const curso_id = Number(req.params.cursoId)
    const periodo_id = req.query.periodo_id ? Number(req.query.periodo_id) : undefined
    const estado = req.query.estado ? String(req.query.estado) : undefined
    const matriculas = await MatriculaRepository.findByCursoFiltrado(curso_id, { periodo_id, estado })
    res.status(200).json({ success: true, data: matriculas })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const { matricula: matriculaData } = req.body as CreateMatriculaDTO

    const periodoActivo = await PeriodoMatriculaRepository.findActivo()
    if (!periodoActivo) throw new AppError("No hay período de matrícula activo", 400)

    const existente = await MatriculaRepository.findByEstudianteAndPeriodo(
      matriculaData.estudiante_id,
      periodoActivo.periodo_id
    )
    if (existente) throw new AppError("El estudiante ya tiene matrícula en el período activo", 409)

    const matricula = await MatriculaRepository.create({
      ...matriculaData,
      periodo_id: periodoActivo.periodo_id,
    })

    await registrarAuditoria({
      tabla_nombre: "matriculas",
      accion: "CREATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { matriculaId: matricula.matricula_id, estudianteId: matriculaData.estudiante_id, cursoId: matriculaData.curso_id },
    })

    res.status(201).json({ success: true, data: matricula, message: "Matrícula creada exitosamente" })
  })


  // --------------------------------------------------------------------------
  // ProcessMatricula — flujo completo de matrícula con archivos
  //
  // Hace todo en una sola petición:
  //   1. Valida que el estudiante exista
  //   2. Resuelve el período activo automáticamente
  //   3. Crea la matrícula (o reutiliza la existente si ya fue creada)
  //   4. Valida y guarda los archivos físicos (multer ya los subió)
  //   5. Persiste los registros en `archivos`
  //   6. Asocia cada archivo a la matrícula en `matricula_archivos`
  //   7. En caso de error en cualquier paso: elimina los archivos físicos del disco
  //
  // Analogía: es como registrarse en un hotel. No basta con llegar (matrícula),
  // también hay que entregar los documentos (archivos) y que el recepcionista
  // los adjunte a tu reserva (asociación). Si algo falla en el medio, no quedas
  // "a medias registrado" — todo se revierte.
  //
  // Formato del request (multipart/form-data):
  //   - archivos:    File[]  — los archivos físicos
  //   - persona_id:  number  — persona del estudiante
  //   - curso_id:    number  — curso al que se matricula
  //   - jornada_id:  number  — jornada
  //   - metadata:    JSON string — [{ tipo_archivo_id: 1, descripcion: "..." }, ...]
  //                  Un objeto por cada archivo, en el mismo orden
  // --------------------------------------------------------------------------
  ProcessMatricula = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      // Multer ya guardó los archivos físicos antes de llegar aquí.
      // Si la validación falla, hay que limpiarlos del disco.
      if (req.files) await archivoService.deleteFileArray(req.files as Express.Multer.File[])
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const userId = req.user!.userId
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      throw new AppError("Se requiere al menos un archivo", 400)
    }

    const { metadata, matricula } = req.body

    let matriculaData: CreateMatriculaDTO["matricula"]
    try {
      matriculaData = typeof matricula === "string" ? JSON.parse(matricula) : matricula
    } catch {
      await archivoService.deleteFileArray(files)
      throw new AppError("El formato de matricula no es válido. Debe ser un JSON.", 400)
    }

    if (!matriculaData || typeof matriculaData !== "object") {
      await archivoService.deleteFileArray(files)
      throw new AppError("Se requiere el objeto matricula en formato JSON.", 400)
    }



    // ------------------------------------------------------------------
    // Verificar que el estudiante existe por persona_id
    // ------------------------------------------------------------------
    const estudiante = await EstudianteRepository.findById(matriculaData.estudiante_id)
    if (!estudiante) {
      await archivoService.deleteFileArray(files)
      throw new AppError("No se encontró un estudiante asociado a esa persona", 404)
    }


    // ------------------------------------------------------------------
    // Verificar el estado del estudiante. Solo se pueden matricular estudiantes inactivos.
    // ------------------------------------------------------------------
    const estadoEstudiante: string = estudiante.estudiante?.estado_efectivo ?? estudiante.estudiante?.estado
    if (estadoEstudiante === "graduado") {
      await archivoService.deleteFileArray(files)
      throw new AppError("No se puede matricular a un estudiante egresado", 409)
    }
    if (estadoEstudiante === "expulsado") {
      await archivoService.deleteFileArray(files)
      throw new AppError("No se puede matricular a un estudiante expulsado", 409)
    }

    if (!matriculaData.curso_id) {
      await archivoService.deleteFileArray(files)
      throw new AppError("Se requiere curso_id para crear la matrícula", 400)
    }

    // ------------------------------------------------------------------
    // Parsear metadata
    // La metadata viene como JSON string desde FormData porque multipart
    // no puede enviar objetos anidados directamente.
    // ------------------------------------------------------------------
    const metadataArray = archivoService.normalizeMetadata(metadata)


    if (metadataArray.length !== files.length) {
      await archivoService.deleteFileArray(files)
      throw new AppError(
        `La cantidad de metadata (${metadataArray.length}) no coincide con la cantidad de archivos (${files.length})`,
        400
      )
    }

    // ------------------------------------------------------------------
    // Obtener los tipos de archivo requeridos para el contexto matrícula
    // Esto nos da la lista de tipos VÁLIDOS para una matrícula.
    // Se hace fuera de la transacción porque es solo lectura y es costoso
    // repetirlo por cada archivo.
    // ------------------------------------------------------------------
    const tiposRequeridosEnMatricula = await TipoArchivoRepository.findByContexto("matricula")

    if (tiposRequeridosEnMatricula.length === 0) {
      await archivoService.deleteFileArray(files)
      throw new AppError("No hay tipos de archivo configurados para el contexto de matrícula", 500)
    }

    const tiposPermitidosIds = new Set(
      tiposRequeridosEnMatricula.map((t: any) => t.tipo_archivo_id)
    )

    // ------------------------------------------------------------------
    // Validar cada archivo antes de tocar la BD.
    // Si falla algo se amnda error, el orden es importante 
    // 
    // ------------------------------------------------------------------
    const archivosValidados: Array<{
      file: Express.Multer.File
      meta: { tipo_archivo_id: number; descripcion?: string }
      tipoArchivo: any
    }> = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const meta = metadataArray[i]

      const tipoArchivo = await TipoArchivoRepository.findById(Number(meta.tipo_archivo_id))
      if (!tipoArchivo) {
        await archivoService.deleteFileArray(files)
        throw new AppError(`Tipo de archivo con ID ${meta.tipo_archivo_id} no encontrado`, 404)
      }

      // El tipo de archivo debe estar permitido en el contexto matrícula.
      // no se puede entregar una hoja de vida para matricularse es ilogico —
      // solo se aceptan los documentos del contexto matrícula.
      if (!tiposPermitidosIds.has(Number(meta.tipo_archivo_id))) {
        await archivoService.deleteFileArray(files)
        throw new AppError(
          `El tipo de archivo "${tipoArchivo.nombre}" no está permitido para el contexto de matrícula`,
          400
        )
      }

      // Error de logica, pero se deja comentado por si se quiere activar la validación de permisos a futuro.
      // Cuando se intenta registrar la matricula esta da error debido a que matricula se asume como rol, esto crea un conflicto de logica ya que un estudiante no es matricula
      // La persona debe tener permiso para subir este tipo específico.

      // const puedeSubir = await PersonaRepository.personaPuedeSubirArchivo(
      //   Number(estudiante.persona.persona_id),
      //   Number(meta.tipo_archivo_id)
      // )
      // if (!puedeSubir) {
      //   await archivoService.deleteFileArray(files)
      //   throw new AppError(
      //     `Esta persona no tiene permiso para subir el tipo de archivo: "${tipoArchivo.nombre}"`,
      //     403
      //   )
      // }

      // La extensión del archivo debe estar en la lista blanca del tipo.

      const ext = path.extname(file.originalname).toLowerCase()
      const extPermitida = await TipoArchivoRepository.isExtensionAllowed(
        Number(meta.tipo_archivo_id),
        ext
      )
      if (!extPermitida) {
        await archivoService.deleteFileArray(files)
        throw new AppError(
          `La extensión ${ext} no está permitida para "${tipoArchivo.nombre}"`,
          400
        )
      }

      archivosValidados.push({ file, meta: { tipo_archivo_id: Number(meta.tipo_archivo_id), descripcion: meta.descripcion ?? undefined }, tipoArchivo })
    }

    // ------------------------------------------------------------------
    // Transacion principal: crea matricula, registra archovos y asociaciones si algo falla no se hace nada
    // Todo en la cama o todo a la basura >:v
    // ------------------------------------------------------------------
    try {
      const resultado = await transaction(async (client) => {

        // 5a. Resolver período activo
        const periodoActivo = await PeriodoMatriculaRepository.findActivo()
        if (!periodoActivo) {
          throw new AppError("No hay período de matrícula activo", 400)
        }

        // Crear matrícula o reutilizar la existente en este período.
        // El UNIQUE(estudiante_id, periodo_id) en la BD lo garantiza,
        // pero damos un mensaje amigable antes de llegar al constraint o no toque la DB
        let matricula = await MatriculaRepository.findByEstudianteAndPeriodo(
          estudiante.estudiante.estudiante_id,
          periodoActivo.periodo_id
        )

        if (!matricula) {
          matricula = await MatriculaRepository.create(
            {
              estudiante_id: estudiante.estudiante.estudiante_id,
              curso_id: Number(matriculaData.curso_id),
              periodo_id: periodoActivo.periodo_id,
              estado: "activa" as any,
            },
            client
          )
        } else {
          throw new AppError("El estudiante ya tiene matricula en el periodo activo", 409)
        }

        // 5c. Guardar registros de archivos en la BD
        const ArchivosCreationAttributes = archivosValidados.map(({ file, meta }) => ({
          persona_id: Number(estudiante.persona.persona_id),
          tipo_archivo_id: Number(meta.tipo_archivo_id),
          nombre: file.originalname,
          descripcion: meta.descripcion || undefined,
          url_archivo: getFileUrl(file),
          asignado_por: userId,
        }))



        const archivosGuardados = await ArchivoRepository.bulkCreate(ArchivosCreationAttributes, client)



        // Asociacion de cada archivo a la matrícula
        const archivoIds = archivosGuardados.map((a: any) => a.archivo_id)
        console.log("Id de archivos guardados: ", archivoIds, "que se asociaran a matricula: ", matricula.matricula_id)

        await MatriculaArchivoRepository.asociarBulk(matricula.matricula_id, archivoIds, client)

        return { matricula, archivosGuardados }
      })

      res.status(201).json({
        success: true,
        message: `Matrícula procesada. ${resultado.archivosGuardados.length} archivo(s) asociado(s).`,
        data: {
          matricula: resultado.matricula,
          archivos: resultado.archivosGuardados.map((archivo: any, index: number) => ({
            ...archivo,
            file_info: {
              originalName: archivosValidados[index].file.originalname,
              size: archivosValidados[index].file.size,
              mimetype: archivosValidados[index].file.mimetype,
            },
          })),
        },
      })
    } catch (error) {
      // Si algo falla todos los archivos físicos que se subieron al inicio deben son eliminados para evitar tener archivos huérfanos en el disco.
      await archivoService.deleteFileArray(files)
      throw error
    }
  })

  // --------------------------------------------------------------------------
  // retirar — cambia el estado de la matrícula a "retirada" y registra el motivo
  // --------------------------------------------------------------------------
  retirar = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.matriculaId)
    const { motivo } = req.body

    const matricula = await MatriculaRepository.findById(id)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    if (matricula.estado_raw === "retirada") {
      throw new AppError("La matrícula ya está en estado retirada", 409)
    }

    if (matricula.estado_raw === "finalizada") {
      throw new AppError("No se puede retirar una matrícula ya finalizada", 409)
    }

    const actualizada = await MatriculaRepository.retirar(id, motivo)

    await registrarAuditoria({
      tabla_nombre: "matriculas",
      accion: "UPDATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { matriculaId: id, motivo: motivo ?? null, estado: "retirada" },
    })

    res.status(200).json({
      success: true,
      message: "Estudiante retirado de la matrícula exitosamente",
      data: actualizada,
    })
  })


  // --------------------------------------------------------------------------
  // update — actualiza campos de la matrícula, pero solo si no está retirada o finalizada
  // Deberia llamarse de otra forma, solo modifica grado y jornada, no se puede modificar nada mas, el nombre update es muy generico para lo que hace esta función
  // Ademas tambien guarda el historial de cambios, lo que es importante para el seguimiento de la matricula, pero el nombre no refleja esa funcionalidad
  // Como lo llamaria? Nota: renombrar esta función es un breaking change, hay que actualizar el nombre en las rutas y en los tests
  // --------------------------------------------------------------------------
  update = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const id = Number(req.params.id)
    const { matricula: matriculaData } = req.body as UpdateMatriculaDTO
    const userId = req.user!.userId

    const matriculaActual = await MatriculaRepository.findById(id)
    if (!matriculaActual) throw new AppError("Matrícula no encontrada", 404)

    const estadoActual = matriculaActual.estado_raw ?? matriculaActual.estado
    if (estadoActual === "retirada" || estadoActual === "finalizada") {
      throw new AppError(`No se puede modificar una matrícula en estado "${estadoActual}"`, 409)
    }

    const PeriodoMatricula = await PeriodoMatriculaRepository.findById(matriculaActual.periodo_id)
    if (PeriodoMatricula && PeriodoMatricula.estado_raw === "retirada") {
      throw new AppError("No se pueden modificar matrículas de períodos cerrados", 400)
    }

    const matricula = await transaction(async (client) => {
      await MatriculaRepository.registrarHistorial(
        matriculaActual,
        matriculaData,
        userId,
        req.body.motivo_cambio,
        client
      )
      return await MatriculaRepository.update(id, matriculaData, client)
    })

    res.status(200).json({ success: true, data: matricula, message: "Matrícula actualizada exitosamente" })
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const matricula = await MatriculaRepository.delete(Number(id))

    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    res.status(200).json({ success: true, data: matricula, message: "Matrícula eliminada exitosamente" })
  })
}
