import type { Request, Response, NextFunction } from "express"
import { Persona } from "../../models/sequelize/Persona"
import { ValidationError } from "sequelize"

export const validateCreatePersonaDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {persona: persona} = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Persona.build(persona).validate()

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

export const validateUpdatePersonaDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {persona: persona} = req.body

    await Persona.build(persona).validate({ skip: ["tipo_documento_id", "numero_documento"] })

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
