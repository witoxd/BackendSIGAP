import type { Request, Response, NextFunction } from "express"
import { Administrativo } from "../../models/sequelize/Administrativo"
import { Persona } from "../../models/sequelize/Persona"
import { ValidationError } from "sequelize"

export const validateCreateAdministrativoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { administrativo, persona } = req.body

    // Validacion dominio con Sequelize 
    await Administrativo.build(administrativo).validate({ skip: ["persona_id"] })
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

export const validateUpdateAdministrativoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { administrativo, persona } = req.body

    // Para update, validamos solo los campos proporcionados
    if (administrativo) {
      await Administrativo.build(administrativo).validate({ skip: ["persona_id"] })
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
