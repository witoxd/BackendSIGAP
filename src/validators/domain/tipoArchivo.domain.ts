import type { Request, Response, NextFunction } from "express"
import { TipoArchivo } from "../../models/sequelize/TipoArchivo"
import { ValidationError } from "sequelize"

export const validateCreateTipoArchivoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tipo_archivo: TipoArchivoData } = req.body

    // Validación dominio con Sequelize (NO DB)
    await TipoArchivo.build(TipoArchivoData).validate()

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      })
    }

    next(error)
  }
}

export const validateUpdateTipoArchivoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tipo_archivo: TipoArchivoData } = req.body

    if (TipoArchivoData && Object.keys(TipoArchivoData).length > 0) {
      await TipoArchivo.build(TipoArchivoData).validate({
        skip: ["tipo_archivo_id", "nombre"],
      })
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      })
    }

    next(error)
  }
}
