import type { Request, Response, NextFunction } from "express"
import { Role } from "../../models/sequelize/Role"
import { ValidationError } from "sequelize"

export const validateCreateRoleDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Role.build(role).validate()

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

export const validateUpdateRoleDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = req.body

    await Role.build(role).validate()

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
