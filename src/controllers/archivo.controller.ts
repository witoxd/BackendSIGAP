import type { Request, Response } from "express"
import { ArchivoRepository } from "../models/Repository/ArchivoRepository"
import { TipoArchivoRepository } from "../models/Repository/TipoArchivoRepository"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"
import { validationResult } from "express-validator"
import { deleteFile, getFileUrl } from "../config/multer"
import path from "path"
import fs from "fs"
import { asyncHandler } from "../utils/asyncHandler"
import { archivoService } from "../services/archivos.services"

export class ArchivoController {
   getAll = asyncHandler(async (req: Request, res: Response) => {
      const { page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      const archivos = await ArchivoRepository.findAll(pLimit, offset)
      const total = await ArchivoRepository.count()

      res.status(200).json({
        success: true,
        data: archivos,
        pagination: {
          page: Math.floor(offset / pLimit) + 1,
          limit: pLimit,
          total,
          pages: Math.ceil(total / pLimit),
        },
      })
  })

   getById = asyncHandler(async (req: Request, res: Response) => {

      const id = Number(req.params.id)
      const archivo = await ArchivoRepository.findById(id)

      if (!archivo) {
        throw new AppError("Archivo no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: archivo,
      })
  })

   getByPersonaId = asyncHandler(async (req: Request, res: Response) => {

      const personaId = Number(req.params.personaId)
      const archivos = await ArchivoRepository.findByPersonaId(personaId)

      res.status(200).json({
        success: true,
        data: archivos,
      })
  })

   getByTipo = asyncHandler(async (req: Request, res: Response) => {

      const { tipo_archivo_id, page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      if (!tipo_archivo_id) {
        throw new AppError("El ID del tipo de archivo es requerido", 400)
      }

      const archivos = await ArchivoRepository.findByTipo(Number(tipo_archivo_id), pLimit, offset)

      res.status(200).json({
        success: true,
        data: archivos,
      })
  })

   getByTipoAndPersona = asyncHandler(async (req: Request, res: Response) => {

      const { tipo_archivo_id, persona_id, page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      if (!tipo_archivo_id || !persona_id) {
        throw new AppError("El ID del tipo de archivo y el ID de la persona son requeridos", 400)
      }

      const archivos = await ArchivoRepository.findByTipoAndPerson(Number(tipo_archivo_id), Number(persona_id), pLimit, offset)

      res.status(200).json({
        success: true,
        data: archivos,
      })

  })

   getPhotoByPersonaId = asyncHandler(async (req: Request, res: Response) => {

      const personaId = Number(req.params.personaId)
      const archivo = await ArchivoRepository.findPhotoByPersonaId(personaId)

      if (!archivo) {
        throw new AppError("Foto no encontrada para esta persona", 404)
      }

      const filePath = path.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""))

      if (!fs.existsSync(filePath)) {
        throw new AppError("El archivo físico no existe", 404)
      }

      const ext = path.extname(filePath).toLowerCase()
      const contentTypes: { [key: string]: string } = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
      }

      const contentType = contentTypes[ext] || "application/octet-stream"

      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `inline; filename="${archivo.nombre}"`)
      res.sendFile(filePath)
  })

  /**
   * Crear un nuevo archivo con subida física
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        if (req.file) await deleteFile(req.file.path)
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const userId = req.user!.userId

      if (!req.file) {
        throw new AppError("Se requiere un archivo", 400)
      }

      const { persona_id, descripcion, tipo_archivo_id } = req.body

      // Verificar que la persona existe
      const persona = await PersonaRepository.findById(Number(persona_id))
      if (!persona) {
        await deleteFile(req.file.path)
        throw new AppError("Persona no encontrada", 404)
      }

      // Verificar que el tipo de archivo existe
      const tipoArchivo = await TipoArchivoRepository.findById(Number(tipo_archivo_id))
      if (!tipoArchivo) {
        await deleteFile(req.file.path)
        throw new AppError("Tipo de archivo no encontrado", 404)
      }

      // Verificar que la persona tiene permiso para subir este tipo de archivo
      const personaPuedeSubirArchivo = await PersonaRepository.personaPuedeSubirArchivo(Number(persona_id), Number(tipo_archivo_id))
      if (!personaPuedeSubirArchivo) {
        await deleteFile(req.file.path)
        throw new AppError("La persona no tiene permiso para subir este tipo de archivo", 403)
      }

      // Verificar que la extensión está permitida
      const ext = path.extname(req.file.originalname).toLowerCase()
      const isAllowed = await TipoArchivoRepository.isExtensionAllowed(Number(tipo_archivo_id), ext)
      if (!isAllowed) {
        await deleteFile(req.file.path)
        throw new AppError(
          `La extensión ${ext} no está permitida para el tipo de archivo ${tipoArchivo.nombre}`,
          400
        )
      }

      const urlArchivo = getFileUrl(req.file)

      const archivo = await ArchivoRepository.create({
        persona_id: Number(persona_id),
        tipo_archivo_id: Number(tipo_archivo_id),
        nombre: req.file.originalname,
        descripcion: descripcion || null,
        url_archivo: urlArchivo,
        asignado_por: userId,
      })

      res.status(201).json({
        success: true,
        message: "Archivo creado exitosamente",
        data: {
          ...archivo,
          file_info: {
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
          },
        },
      })
    } catch (error) {
      // Cleanup: eliminar archivo físico si alguna validación falla después del upload
      if (req.file) await deleteFile(req.file.path).catch(() => {})
      throw error
    }
  })

  /**
   * Crear múltiples archivos con metadata individual
   * FORMATO:
   * - archivos: array de files
   * - persona_id: número
   * - metadata: JSON string array con: [{"tipo_archivo_id":1,"descripcion":"..."}, ...]
   */
  bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        if (req.files) await archivoService.deleteFileArray(req.files as Express.Multer.File[])
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const userId = req.user!.userId
      const files = req.files as Express.Multer.File[]

      if (!files || files.length === 0) {
        throw new AppError("Se requiere al menos un archivo", 400)
      }

      const { persona_id, metadata } = req.body
      const metadataArray = archivoService.normalizeMetadata(metadata)
      const archivos = await archivoService.RegisterFileArray(
        files,
        metadataArray,
        Number(persona_id),
        userId
      )

      res.status(201).json({
        success: true,
        message: `${archivos.length} archivos creados exitosamente`,
        total: archivos.length,
        data: archivos,
      })
    } catch (error) {
      // Cleanup: eliminar archivos físicos si alguna validación o registro falla
      if (req.files) await archivoService.deleteFileArray(req.files as Express.Multer.File[]).catch(() => {})
      throw error
    }
  })

  /**
   * Actualizar un archivo (opcionalmente con nuevo archivo físico)
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        if (req.file) await deleteFile(req.file.path)
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const id = Number(req.params.id)

      const archivoActual = await ArchivoRepository.findById(id)
      if (!archivoActual) {
        if (req.file) await deleteFile(req.file.path)
        throw new AppError("Archivo no encontrado", 404)
      }

      const updateData: any = {
        descripcion: req.body.descripcion,
        tipo_archivo_id: req.body.tipo_archivo_id ? Number(req.body.tipo_archivo_id) : undefined,
      }

      // Si se actualiza el tipo de archivo, validar que existe
      if (updateData.tipo_archivo_id) {
        const tipoArchivo = await TipoArchivoRepository.findById(updateData.tipo_archivo_id)
        if (!tipoArchivo) {
          if (req.file) await deleteFile(req.file.path)
          throw new AppError("Tipo de archivo no encontrado", 404)
        }
      }

      if (req.file) {
        const oldFilePath = archivoActual.url_archivo
        updateData.url_archivo = getFileUrl(req.file)
        updateData.nombre = req.file.originalname

        // Validar extensión si hay tipo de archivo
        const tipoArchivoId = updateData.tipo_archivo_id || archivoActual.tipo_archivo_id
        const ext = path.extname(req.file.originalname).toLowerCase()
        const isAllowed = await TipoArchivoRepository.isExtensionAllowed(tipoArchivoId, ext)
        if (!isAllowed) {
          await deleteFile(req.file.path)
          const tipoArchivo = await TipoArchivoRepository.findById(tipoArchivoId)
          throw new AppError(
            `La extensión ${ext} no está permitida para ${tipoArchivo?.nombre}`,
            400
          )
        }

        const archivo = await ArchivoRepository.update(id, updateData)

        // Eliminar archivo anterior tras confirmar que el update fue exitoso
        if (oldFilePath) {
          const absolutePath = path.join(process.cwd(), oldFilePath.replace(/^\//, ""))
          await deleteFile(absolutePath).catch(() => {})
        }

        res.status(200).json({
          success: true,
          message: "Archivo actualizado exitosamente",
          data: {
            ...archivo,
            file_info: {
              originalName: req.file.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
            },
          },
        })
      } else {
        const archivo = await ArchivoRepository.update(id, updateData)

        if (!archivo) {
          throw new AppError("Archivo no encontrado o sin cambios", 404)
        }

        res.status(200).json({
          success: true,
          message: "Archivo actualizado exitosamente",
          data: archivo,
        })
      }
    } catch (error) {
      // Cleanup: eliminar archivo nuevo si el update falló
      if (req.file) await deleteFile(req.file.path).catch(() => {})
      throw error
    }
  })

  /**
   * Eliminar archivo (registro y archivo físico)
   */
   delete = asyncHandler( async (req: Request, res: Response) => {

      const id = Number(req.params.id)

      const archivo = await ArchivoRepository.findById(id)
      if (!archivo) {
        throw new AppError("Archivo no encontrado", 404)
      }

      await ArchivoRepository.softDelete(id)

      if (archivo.url_archivo) {
        try {
          const absolutePath = path.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""))
          await deleteFile(absolutePath)
        } catch (deleteError) {
          console.error("Error al eliminar archivo físico:", deleteError)
        }
      }

      res.status(200).json({
        success: true,
        message: "Archivo eliminado exitosamente",
      })

  })

  /**
   * Descargar archivo
   */
   download = asyncHandler(async (req: Request, res: Response) => {

      const id = Number(req.params.id)

      const archivo = await ArchivoRepository.findById(id)
      if (!archivo) {
        throw new AppError("Archivo no encontrado", 404)
      }

      const filePath = path.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""))

      if (!fs.existsSync(filePath)) {
        throw new AppError("El archivo físico no existe", 404)
      }

      res.setHeader("Content-Disposition", `attachment; filename="${archivo.nombre}"`)
      res.setHeader("Content-Type", "application/octet-stream")
      res.sendFile(filePath)

  })

  /**
   * Ver archivo en navegador
   */
   view = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const archivo = await ArchivoRepository.findById(id)
    if (!archivo) {
      throw new AppError("Archivo no encontrado", 404)
    }

    const filePath = path.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""))

    if (!fs.existsSync(filePath)) {
      throw new AppError("El archivo físico no existe", 404)
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentTypes: { [key: string]: string } = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    }

    const contentType = contentTypes[ext] || "application/octet-stream"

    res.setHeader("Content-Type", contentType)
    res.setHeader("Content-Disposition", `inline; filename="${archivo.nombre}"`)
    res.sendFile(filePath)
  })

}
