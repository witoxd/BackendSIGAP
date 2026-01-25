import type { Request, Response, NextFunction } from "express"
import { Permiso } from "../../models/sequelize/Permiso"
import { ValidationError } from "sequelize"

export const validateCreatePermisoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permiso = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Permiso.build(permiso).validate()

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

export const validateUpdatePermisoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permiso = req.body

    await Permiso.build(permiso).validate()

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
