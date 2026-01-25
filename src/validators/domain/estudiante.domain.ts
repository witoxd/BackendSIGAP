import type { Request, Response, NextFunction } from "express"
import { Estudiante } from "../../models/sequelize/Estudiante"
import { Persona } from "../../models/sequelize/Persona"
import { ValidationError } from "sequelize"

export const validateCreateEstudianteDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudiante, persona } = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Estudiante.build(estudiante).validate({ skip: ["persona_id"] })
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

export const validateUpdateEstudianteDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estudiante, persona } = req.body

    if (estudiante) {
      await Estudiante.build(estudiante).validate({ skip: ["persona_id", "sede_id", "jornada_id", "estado"] })
    }
    if (persona) {
      await Persona.build(persona).validate({ skip: ["nombres", "tipo_documento_id", "numero_documento", "fecha_nacimiento", "genero"] })
    }

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
