import type { Request, Response, NextFunction } from "express"
import { MatriculaRepository } from "../models/Repository/MatriculaRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { CreateMatriculaDTO, UpdateMatriculaDTO } from "../types"
import { PeriodoMatriculaRepository } from "../models/Repository/PeriodoMatriculaRepository"
import { asyncHandler } from "../utils/asyncHandler"
import { deleteFile, getFileUrl } from "../config/multer"
import { ArchivoRepository } from "../models/Repository/ArchivoRepository"
import { TipoArchivoRepository } from "../models/Repository/TipoArchivoRepository"
import path from "path"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { archivoService } from "../services/archivos.services"
import { EstudianteRepository } from "../models/Repository/EstudianteRepository"
import { archivoMatriculaService } from "../services/archivosMatricula.services"

export class MatriculaController {

   getAll = asyncHandler( async (req: Request, res: Response) => {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const offset = Number.parseInt(req.query.offset as string) || 0

    const matriculas = await MatriculaRepository.findAll(limit, offset)
    const total = await MatriculaRepository.count()

    res.status(200).json({
      success: true,
      data: matriculas,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    })
  })

   getById = asyncHandler( async (req: Request, res: Response) => {
    const { id } = req.params
    const matricula = await MatriculaRepository.findById(Number(id))

    if (!matricula) {
      throw new AppError("Matrícula no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: matricula,
    })
  })

   getByEstudiante = asyncHandler ( async (req: Request, res: Response) => {
    const estudiante_id = Number(req.params)
    const matriculas = await MatriculaRepository.findByEstudiante(estudiante_id)

    res.status(200).json({
      success: true,
      data: matriculas,
    })
  })

   getByCurso = asyncHandler( async (req: Request, res: Response) => {
    const curso_id = Number(req.params)
    const matriculas = await MatriculaRepository.findByCurso(curso_id)

    res.status(200).json({
      success: true,
      data: matriculas,
    })
  })

   create = asyncHandler ( async (req: Request, res: Response) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const { matricula: matriculaData } = req.body as CreateMatriculaDTO

    // 1. Resolver período activo automáticamente
    const periodoActivo = await PeriodoMatriculaRepository.findActivo()
    if (!periodoActivo) {
      throw new AppError("No hay período de matrícula activo", 400)
    }

    // 2. El UNIQUE(estudiante_id, periodo_id) en la BD ya previene duplicados,
    //    pero puedes dar un mensaje más amigable verificando antes:
    const existente = await MatriculaRepository.findByEstudianteAndPeriodo(
      matriculaData.estudiante_id,
      periodoActivo.periodo_id
    )
    if (existente) {
      throw new AppError("El estudiante ya tiene matrícula en el período activo", 409)
    }

    // 3. Crear con periodo_id resuelto
    const matricula = await MatriculaRepository.create({
      ...matriculaData,
      periodo_id: periodoActivo.periodo_id
    })

  
    res.status(201).json({
      success: true,
      data: matricula,
      message: "Matrícula creada exitosamente",
    })
  })

    async PreocessMatricula(req: Request, res: Response, next: NextFunction) {
  
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          if (req.files) {
            await archivoService.deleteFileArray(req.files as Express.Multer.File[])
           }
          throw new AppError("Errores de validación", 400, errors.array())
        }
  
        const userId = req.user!.userId
        const files = req.files as Express.Multer.File[]
  
        if (!files || files.length === 0) {
          throw new AppError("Se requiere al menos un archivo", 400)
        }
  
        const { persona_id, metadata } = req.body
  
        // Verificar que la persona existe
        const estudiante = await EstudianteRepository.findByPersonaId(Number(persona_id))
        if (!estudiante) {
          await archivoService.deleteFileArray(files)
          throw new AppError("Persona no encontrada", 404)
        }
  
        // Parsear metadata (puede venir como string JSON o array)
        let metadataArray: any[] = []
        if (metadata) {
          try {
            metadataArray = typeof metadata === 'string' ? JSON.parse(metadata) : metadata
          } catch (e) {
            await archivoService.deleteFileArray(files)
            throw new AppError("El formato de metadata no es válido", 400)
          }
        }
  
        // Validar que haya metadata para cada archivo
        if (metadataArray.length !== files.length) {
            await archivoService.deleteFileArray(files)
          throw new AppError(
            `Se requiere metadata para cada archivo. Archivos: ${files.length}, Metadata: ${metadataArray.length}`,
            400
          )
        }
  
        // Construir array de datos con validaciones
        const archivosData = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const meta = metadataArray[i]
  
          // Verificar tipo de archivo
          const tipoArchivo = await TipoArchivoRepository.findById(Number(meta.tipo_archivo_id))
          if (!tipoArchivo) {
            await archivoService.deleteFileArray(files)
            throw new AppError(`Tipo de archivo con ID ${meta.tipo_archivo_id} no encontrado`, 404)
          }
  
          // Verificar que la persona tiene permiso para subir este tipo de archivo
          const personaPuedeSubirArchivo = await PersonaRepository.personaPuedeSubirArchivo(Number(persona_id), Number(meta.tipo_archivo_id))
          if (!personaPuedeSubirArchivo) {
            await archivoService.deleteFileArray(files)
            throw new AppError(`La persona no tiene permiso para subir este tipo de archivo: ${meta.tipo_archivo_id}`, 403)
          }
  
          // Verificar extensión permitida
          const ext = path.extname(file.originalname).toLowerCase()
          const isAllowed = await TipoArchivoRepository.isExtensionAllowed(Number(meta.tipo_archivo_id), ext)
          if (!isAllowed) {
            throw new AppError(
              `La extensión ${ext} no está permitida para ${tipoArchivo.nombre} (archivo: ${file.originalname})`,
              400
            )
          }

         const context = await TipoArchivoRepository.findRequeridosPor("matricula")

         if(context.length > 0){
          const tipoArchivoContexto = context.find((tipo: any) => tipo.tipo_archivo_id === Number(meta.tipo_archivo_id))
          if(!tipoArchivoContexto){
            throw new AppError(
              `El tipo de archivo ${tipoArchivo.nombre} no es permitido en el contexto de matrícula`,
              400
            )
          }
         } else {
          throw new AppError(
            `No hay tipos de archivo permitidos para el contexto de matrícula`,
            400
          )
         }
  
          archivosData.push({
            persona_id: Number(persona_id),
            tipo_archivo_id: Number(meta.tipo_archivo_id),
            nombre: file.originalname,
            descripcion: meta.descripcion || null,
            url_archivo: getFileUrl(file),
            asignado_por: userId,
          })
        }
  
        // Guardar todos en la base de datos
        const archivos = await ArchivoRepository.bulkCreate(archivosData)
  
        res.status(201).json({
          success: true,
          message: `${archivos.length} archivos creados exitosamente`,
          total: archivos.length,
          data: archivos.map((archivo: any, index: number) => ({
            ...archivo,
            file_info: {
              originalName: files[index].originalname,
              size: files[index].size,
              mimetype: files[index].mimetype,
            },
          })),
        })
      } catch (error) {
        // Rollback: eliminar archivos físicos en caso de error
        if (req.files) {
          try {
           await archivoService.deleteFileArray(req.files as Express.Multer.File[])
          } catch (deleteError) {
            console.error("Error limpiando archivos:", deleteError)
          }
        }
        next(error)
      }
    }

   update = asyncHandler( async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const id = Number(req.params.id)

    const { matricula: matriculaData } = req.body as UpdateMatriculaDTO
    const matricula = await MatriculaRepository.update(id, matriculaData)

    if (!matricula) {
      throw new AppError("Matrícula no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: matricula,
      message: "Matrícula actualizada exitosamente",
    })
  })

   delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const matricula = await MatriculaRepository.delete(Number(id))

    if (!matricula) {
      throw new AppError("Matrícula no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: matricula,
      message: "Matrícula eliminada exitosamente",
    })
  })
}
