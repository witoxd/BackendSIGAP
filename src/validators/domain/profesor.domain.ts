import type { Request, Response, NextFunction } from "express"
import { Profesor } from "../../models/sequelize/Profesor"
import { Persona } from "../../models/sequelize/Persona"
import { ValidationError } from "sequelize"

export const validateCreateProfesorDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { profesor, persona } = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Profesor.build(profesor).validate({ skip: ["persona_id"] })
      await Persona.build(persona).validate({ skip: ["tipo_documento_id", "fecha_nacimiento", "genero"] })

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

export const validateUpdateProfesorDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { profesor, persona } = req.body

    if (profesor) {
      await Profesor.build(profesor).validate({ skip: ["persona_id"] })
    }
    if (persona) {
      await Persona.build(persona).validate({ skip: ["tipo_documento_id", "numero_documento", "fecha_nacimiento", "genero"] })
    }

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
