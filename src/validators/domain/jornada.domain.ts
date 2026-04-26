import type { Request, Response, NextFunction } from "express"
import { Jornada } from "../../models/sequelize/Jornada"
import { ValidationError } from "sequelize"

export const validateCreateJornadaDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jornada = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Jornada.build(jornada).validate()

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

export const validateUpdateJornadaDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jornada = req.body

    await Jornada.build(jornada).validate()

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
