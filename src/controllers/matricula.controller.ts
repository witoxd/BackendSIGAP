
import type { Request, Response } from "express"
import { MatriculaRepository } from "../models/Repository/MatriculaRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { CreateMatriculaDTO, UpdateMatriculaDTO } from "../types"
import { PeriodoMatriculaRepository } from "../models/Repository/PeriodoMatriculaRepository"
import { asyncHandler } from "../utils/asyncHandler"
import { getFileUrl } from "../config/multer"
import { ArchivoRepository } from "../models/Repository/ArchivoRepository"
import { TipoArchivoRepository } from "../models/Repository/TipoArchivoRepository"
import path from "path"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
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

  getByEstudiante = asyncHandler(async (req: Request, res: Response) => {
    const estudiante_id = Number(req.params.estudianteId)
    const matriculas = await MatriculaRepository.findByEstudiante(estudiante_id)
    res.status(200).json({ success: true, data: matriculas })
  })

  getByCurso = asyncHandler(async (req: Request, res: Response) => {
    const curso_id = Number(req.params.cursoId)
    const matriculas = await MatriculaRepository.findByCurso(curso_id)
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
    // Paso 1: Verificar que el estudiante existe por persona_id
    // ------------------------------------------------------------------
    const estudiante = await EstudianteRepository.findById(matriculaData.estudiante_id)
    if (!estudiante) {
      await archivoService.deleteFileArray(files)
      throw new AppError("No se encontró un estudiante asociado a esa persona", 404)
    }

    if (!matriculaData.curso_id || !matriculaData.jornada_id) {
      await archivoService.deleteFileArray(files)
      throw new AppError("Se requieren curso_id y jornada_id para crear la matrícula", 400)
    }

    // ------------------------------------------------------------------
    // Paso 2: Parsear metadata
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
    // Paso 3: Obtener tipos de archivo requeridos para el contexto matrícula
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
    // Paso 4: Validar cada archivo antes de tocar la BD.
    // Fallar rápido: verificamos todo antes de iniciar la transacción.
    // Si algo está mal, limpiamos el disco y lanzamos error.
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
      // Analogía: no puedes entregar una hoja de vida para matricularte —
      // solo se aceptan los documentos del contexto matrícula.
      if (!tiposPermitidosIds.has(Number(meta.tipo_archivo_id))) {
        await archivoService.deleteFileArray(files)
        throw new AppError(
          `El tipo de archivo "${tipoArchivo.nombre}" no está permitido para el contexto de matrícula`,
          400
        )
      }

      // La persona debe tener permiso para subir este tipo específico.
      const puedeSubir = await PersonaRepository.personaPuedeSubirArchivo(
        Number(estudiante.persona.persona_id),
        Number(meta.tipo_archivo_id)
      )
      if (!puedeSubir) {
        await archivoService.deleteFileArray(files)
        throw new AppError(
          `Esta persona no tiene permiso para subir el tipo de archivo: "${tipoArchivo.nombre}"`,
          403
        )
      }

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
    // Paso 5: Transacción atómica
    //
    // Todo lo que toca la BD se hace aquí. Si cualquier operación falla,
    // PostgreSQL revierte automáticamente con el ROLLBACK del try/catch
    // de nuestra función transaction().
    //
    // IMPORTANTE: los archivos físicos en disco NO son parte de la
    // transacción de BD — si la transacción falla, hay que eliminarlos
    // manualmente en el catch exterior.
    // ------------------------------------------------------------------
    try {
      const resultado = await transaction(async (client) => {

        // 5a. Resolver período activo
        const periodoActivo = await PeriodoMatriculaRepository.findActivo()
        if (!periodoActivo) {
          throw new AppError("No hay período de matrícula activo", 400)
        }

        // 5b. Crear matrícula o reutilizar la existente en este período.
        // El UNIQUE(estudiante_id, periodo_id) en la BD lo garantiza,
        // pero damos un mensaje amigable antes de llegar al constraint.
        let matricula = await MatriculaRepository.findByEstudianteAndPeriodo(
          estudiante.estudiante.estudiante_id,
          periodoActivo.periodo_id
        )

        if (!matricula) {
          matricula = await MatriculaRepository.create(
            {
              estudiante_id: estudiante.estudiante.estudiante_id,
              curso_id: Number(matriculaData.curso_id),
              jornada_id: Number(matriculaData.jornada_id),
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



        // 5d. Asociar cada archivo a la matrícula
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
      // Si la transacción de BD falló, eliminamos los archivos físicos
      // que multer ya había guardado en disco. Sin esto quedarían huérfanos.
      await archivoService.deleteFileArray(files)
      throw error
    }
  })

  // --------------------------------------------------------------------------
  // retirar — único cambio de estado manual permitido en una matrícula.
  // Los demás estados (activa, finalizada) se derivan de las fechas.
  // --------------------------------------------------------------------------
  retirar = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { motivo } = req.body

    const matricula = await MatriculaRepository.findById(id)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    if (matricula.estado_raw === "retirada") {
      throw new AppError("La matrícula ya está en estado retirada", 409)
    }

    const actualizada = await MatriculaRepository.retirar(id, motivo)

    res.status(200).json({
      success: true,
      message: "Estudiante retirado de la matrícula exitosamente",
      data: actualizada,
    })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const id = Number(req.params.id)
    const { matricula: matriculaData } = req.body as UpdateMatriculaDTO
    const userId = req.user!.userId

    // Obtener estado actual ANTES de modificar — necesario para el historial
    const matriculaActual = await MatriculaRepository.findById(id)
    if (!matriculaActual) throw new AppError("Matrícula no encontrada", 404)

      const PeriodoMatricula = await PeriodoMatriculaRepository.findById(matriculaActual.periodo_id)

  
      if (PeriodoMatricula && PeriodoMatricula.estado_raw === "retirada"){
        throw new AppError("No se pueden modificar matriculas de periodos cerrados", 400)
      }

    const matricula = await transaction(async (client) => {
      // 1. Guardar snapshot del estado anterior
      await MatriculaRepository.registrarHistorial(
        matriculaActual,
        matriculaData,
        userId,
        req.body.motivo_cambio,
        client
      )
      // 2. Aplicar el cambio
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
