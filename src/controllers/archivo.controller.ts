import type { Request, Response, NextFunction } from "express"
import { ArchivoRepository } from "../models/Repository/ArchivoRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"
import type { CreateArchivoDTO, UpdateArchivoDTO } from "../types"
import { validationResult } from "express-validator"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { deleteFile, getFileUrl } from "../config/multer"
import path from "path"
import fs from "fs"


export class ArchivoController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const archivo = await ArchivoRepository.findById(id)

      if (!archivo) {
        throw new AppError("Archivo no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: archivo,
      })
    } catch (error) {
      next(error)
    }
  }

  async getByPersonaId(req: Request, res: Response, next: NextFunction) {
    try {
      const personaId = Number(req.params.personaId)
      const archivos = await ArchivoRepository.findByPersonaId(personaId)

      res.status(200).json({
        success: true,
        data: archivos,
      })
    } catch (error) {
      next(error)
    }
  }

  async getByTipo(req: Request, res: Response, next: NextFunction) {
    try {
      const { tipo_archivo, page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      if (!tipo_archivo) {
        throw new AppError("El tipo de archivo es requerido", 400)
      }

      const archivos = await ArchivoRepository.findByTipo(tipo_archivo as string, pLimit, offset)

      res.status(200).json({
        success: true,
        data: archivos,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Crear un nuevo registro de archivo con subida de archivo fisico
   * El archivo se sube usando multer y se guarda en el sistema de archivos
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        // Si hay errores de validacion, eliminar el archivo subido si existe
        if (req.file) {
          await deleteFile(req.file.path)
        }
        throw new AppError("Errores de validacion", 400, errors.array())
      }

      const userId = req.user!.userId
      console.log("ID del usuario asignando: ", userId)

      // Verificar que se subio un archivo
      if (!req.file) {
        throw new AppError("Se requiere un archivo", 400)
      }

      // Obtener datos del body
      const { persona_id, descripcion, tipo_archivo } = req.body

      // Verificar que la persona existe
      const existingPersona = await PersonaRepository.findById(Number(persona_id))
      if (!existingPersona) {
        // Eliminar archivo subido si la persona no existe
        await deleteFile(req.file.path)
        throw new AppError("Persona asignada no existe", 404)
      }

      // Obtener URL del archivo subido
      const urlArchivo = getFileUrl(req.file)


      // Crear registro en la base de datos
      const archivo = await ArchivoRepository.create({
        persona_id: Number(persona_id),
        nombre: req.file.originalname,
        descripcion: descripcion || null,
        tipo_archivo: tipo_archivo || "otro",
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
      // Limpiar archivo en caso de error
      if (req.file) {
        try {
          await deleteFile(req.file.path)
        } catch (deleteError) {
          console.error("Error al eliminar archivo despues de fallo:", deleteError)
        }
      }
      next(error)
    }
  }


//   /**
//  * Crear uno o varios registros de archivos con subida fisica
//  */
async bulkCreate(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      // Eliminar archivos subidos si hay errores
      if (req.files) {
        await Promise.all(
          (req.files as Express.Multer.File[]).map(file =>
            deleteFile(file.path)
          )
        )
      }
      throw new AppError("Errores de validacion", 400, errors.array())
    }

    const userId = req.user!.userId
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      throw new AppError("Se requiere al menos un archivo", 400)
    }

    const { persona_id } = req.body

    // Verificar persona
    const existingPersona = await PersonaRepository.findById(Number(persona_id))
    if (!existingPersona) {
      await Promise.all(files.map(file => deleteFile(file.path)))
      throw new AppError("Persona asignada no existe", 404)
    }

    // Parsear metadata
    const metadataList = Array.isArray(req.body.metadata)
      ? req.body.metadata.map((m: string) => JSON.parse(m))
      : []

    // Construir registros
    const archivosData = files.map((file, index) => {
      const meta = metadataList.find((m: { index: number }) => m.index === index)

      return {
        persona_id: Number(persona_id),
        nombre: file.originalname,
        descripcion: meta?.descripcion || null,
        tipo_archivo: meta?.tipo_archivo || "otro",
        url_archivo: getFileUrl(file),
        asignado_por: userId,
      }
    })

    // Guardar en BD
    const archivos = await ArchivoRepository.bulkCreate(archivosData)

    res.status(201).json({
      success: true,
      message: "Archivos creados exitosamente",
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
    // Rollback fisico
    if (req.files) {
      try {
        await Promise.all(
          (req.files as Express.Multer.File[]).map(file =>
            deleteFile(file.path)
          )
        )
      } catch (deleteError) {
        console.error("Error limpiando archivos:", deleteError)
      }
    }
    next(error)
  }
}


  /**
   * Actualizar un registro de archivo
   * Opcionalmente puede incluir un nuevo archivo
   */
  async update(req: Request<{ id: string }, unknown, UpdateArchivoDTO>, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        // Si hay errores de validacion, eliminar el nuevo archivo subido si existe
        if (req.file) {
          await deleteFile(req.file.path)
        }
        throw new AppError("Errores de validacion", 400, errors.array())
      }

      const id = Number(req.params.id)

      // Obtener archivo actual
      const archivoActual = await ArchivoRepository.findById(id)
      if (!archivoActual) {
        // Eliminar nuevo archivo si el registro no existe
        if (req.file) {
          await deleteFile(req.file.path)
        }
        throw new AppError("Archivo no encontrado", 404)
      }

      const { archivo: updateData } = req.body as any


      // Si se subio un nuevo archivo
      if (req.file) {
        // Guardar ruta del archivo anterior para eliminarlo despues
        const oldFilePath = archivoActual.url_archivo

        // Actualizar URL con el nuevo archivo
        updateData.url_archivo = getFileUrl(req.file)

        // Actualizar registro en BD
        const archivo = await ArchivoRepository.update(id, updateData)

        // Eliminar archivo anterior del sistema de archivos
        if (oldFilePath) {
          try {
            const absolutePath = path.join(process.cwd(), oldFilePath.replace(/^\//, ""))
            await deleteFile(absolutePath)
          } catch (deleteError) {
            console.error("Error al eliminar archivo anterior:", deleteError)
          }
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
        // Actualizacion sin cambio de archivo
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
      // Limpiar archivo nuevo en caso de error
      if (req.file) {
        try {
          await deleteFile(req.file.path)
        } catch (deleteError) {
          console.error("Error al eliminar archivo despues de fallo:", deleteError)
        }
      }
      next(error)
    }
  }

  /**
   * Eliminar un archivo (registro y archivo fisico)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)

      // Obtener archivo para saber la ruta
      const archivo = await ArchivoRepository.findById(id)
      if (!archivo) {
        throw new AppError("Archivo no encontrado", 404)
      }

      // Eliminar registro de la BD
      await ArchivoRepository.delete(id)

      // Eliminar archivo fisico del sistema de archivos
      if (archivo.url_archivo) {
        try {
          const absolutePath = path.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""))
          await deleteFile(absolutePath)
        } catch (deleteError) {
          console.error("Error al eliminar archivo fisico:", deleteError)
          // No lanzar error, el registro ya fue eliminado
        }
      }

      res.status(200).json({
        success: true,
        message: "Archivo eliminado exitosamente",
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Descargar un archivo
   */
  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)

      const archivo = await ArchivoRepository.findById(id)
      if (!archivo) {
        throw new AppError("Archivo no encontrado", 404)
      }

      const filePath = path.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""))

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new AppError("El archivo fisico no existe en el servidor", 404)
      }

      // Configurar headers para descarga
      res.setHeader("Content-Disposition", `attachment; filename="${archivo.nombre}"`)
      res.setHeader("Content-Type", "application/octet-stream")

      // Enviar archivo
      res.sendFile(filePath)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Ver archivo en el navegador (solo para PDFs e imagenes)
   */
  async view(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)

      const archivo = await ArchivoRepository.findById(id)
      if (!archivo) {
        throw new AppError("Archivo no encontrado", 404)
      }

      const filePath = path.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""))

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new AppError("El archivo fisico no existe en el servidor", 404)
      }

      // Determinar content type
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
    } catch (error) {
      next(error)
    }
  }
}
