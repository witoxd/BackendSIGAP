import type { Request, Response, NextFunction } from "express"
import { TipoDocumento } from "../../models/sequelize/TipoDocumento"
import { ValidationError } from "sequelize"

export const validateCreateTipoDocumentoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {tipo_documento: tipoDocumento} = req.body

    // Validacion dominio con Sequelize (NO DB)
    await TipoDocumento.build(tipoDocumento).validate()

    return next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validacion de dominio",
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      })
    }

    return next(error)
  }
}

export const validateUpdateTipoDocumentoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {tipo_documento: tipoDocumento} = req.body

    await TipoDocumento.build(tipoDocumento).validate()

    return next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validacion de dominio",
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      })
    }

    return next(error)
  }
}
