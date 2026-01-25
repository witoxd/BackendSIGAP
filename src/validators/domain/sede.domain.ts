import type { Request, Response, NextFunction } from "express"
import { Sede } from "../../models/sequelize/Sede"
import { ValidationError } from "sequelize"

export const validateCreateSedeDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sede = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Sede.build(sede).validate()

    next()
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

    next(error)
  }
}

export const validateUpdateSedeDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sede = req.body

    await Sede.build(sede).validate()

    next()
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

    next(error)
  }
}
