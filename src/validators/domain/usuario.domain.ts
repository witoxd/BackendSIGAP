import type { Request, Response, NextFunction } from "express"
import { Usuario } from "../../models/sequelize/Usuario"
import { Persona } from "../../models/sequelize/Persona"
import { ValidationError } from "sequelize"

export const validateCreateUsuarioDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { usuario, persona } = req.body

    // Validacion dominio con Sequelize (NO DB)
    if (usuario) {
      await Usuario.build(usuario).validate()
    }
    if (persona) {
      await Persona.build(persona).validate()
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

export const validateUpdateUsuarioDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { usuario, persona } = req.body

    if (usuario) {
      await Usuario.build(usuario).validate({ skip: ["persona_id", "contraseña"] })
    }
    if (persona) {
      await Persona.build(persona).validate({ skip: ["tipo_documento_id", "numero_documento", "fecha_nacimiento", "genero"] })
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
