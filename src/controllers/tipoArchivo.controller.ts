import type { Request, Response, NextFunction } from "express"
import { TipoArchivoRepository } from "../models/Repository/TipoArchivoRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import type { CreateTipoArchivoDTO, UpdateTipoArchivoDTO } from "../types"

type CreateTipoArchivoStaticRequest = Request<never, unknown, CreateTipoArchivoDTO>
type UpdateTipoArchivoStaticRequest = Request<{ id: string }, unknown, UpdateTipoArchivoDTO>

export class TipoArchivoController {
  /**
   * Obtener todos los tipos de archivo
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tiposArchivo = await TipoArchivoRepository.findAll()

      res.status(200).json({
        success: true,
        data: tiposArchivo,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Obtener tipo de archivo por ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const tipoArchivo = await TipoArchivoRepository.findById(id)

      if (!tipoArchivo) {
        throw new AppError("Tipo de archivo no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: tipoArchivo,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Buscar tipo de archivo por nombre
   */
  async getByNombre(req: Request, res: Response, next: NextFunction) {
    try {
      const { nombre } = req.params
      const tipoArchivo = await TipoArchivoRepository.findByNombre(nombre as string)

      if (!tipoArchivo) {
        throw new AppError("Tipo de archivo no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: tipoArchivo,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Crear un nuevo tipo de archivo
   */
  async create(req: CreateTipoArchivoStaticRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const { tipo_archivo: TipoArchivoData } = req.body

      // Verificar que no exista un tipo con el mismo nombre
      const existingTipo = await TipoArchivoRepository.findByNombre(TipoArchivoData.nombre)
      if (existingTipo) {
        throw new AppError("Ya existe un tipo de archivo con ese nombre", 409)
      }

      const tipoArchivo = await TipoArchivoRepository.create(TipoArchivoData)

      res.status(201).json({
        success: true,
        message: "Tipo de archivo creado exitosamente",
        data: tipoArchivo,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Actualizar un tipo de archivo
   */
  async update(req: UpdateTipoArchivoStaticRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const id = Number(req.params.id)
      const { tipo_archivo: TipoArchivoData } = req.body

      const existingTipo = await TipoArchivoRepository.findById(id)
      if (!existingTipo) {
        throw new AppError("Tipo de archivo no encontrado", 404)
      }

      // Si se intenta cambiar el nombre, verificar que no exista otro con ese nombre
      if (TipoArchivoData.nombre && TipoArchivoData.nombre !== existingTipo.nombre) {
        const tipoConNombre = await TipoArchivoRepository.findByNombre(TipoArchivoData.nombre)
        if (tipoConNombre) {
          throw new AppError("Ya existe otro tipo de archivo con ese nombre", 409)
        }
      }

      const tipoArchivo = await TipoArchivoRepository.update(id, TipoArchivoData)

      if (!tipoArchivo) {
        throw new AppError("Tipo de archivo no encontrado o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Tipo de archivo actualizado exitosamente",
        data: tipoArchivo,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Eliminar un tipo de archivo (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)

      // Verificar si hay archivos usando este tipo
      const count = await TipoArchivoRepository.countByTipo(id)
      if (count > 0) {
        throw new AppError(
          `No se puede eliminar el tipo de archivo porque tiene ${count} archivo(s) asociado(s)`,
          400
        )
      }

      const tipoArchivo = await TipoArchivoRepository.delete(id)

      if (!tipoArchivo) {
        throw new AppError("Tipo de archivo no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        message: "Tipo de archivo eliminado exitosamente",
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Verificar si una extensión es permitida
   */
  async checkExtension(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const { extension } = req.query

      if (!extension) {
        throw new AppError("La extensión es requerida", 400)
      }

      const isAllowed = await TipoArchivoRepository.isExtensionAllowed(
        id,
        extension as string
      )

      res.status(200).json({
        success: true,
        data: {
          tipo_archivo_id: id,
          extension,
          permitida: isAllowed,
        },
      })
    } catch (error) {
      next(error)
    }
  }
}
