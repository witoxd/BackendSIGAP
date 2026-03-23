import type { Request, Response, NextFunction } from "express"
import bcrypt from "bcryptjs"
import { ValidationError } from "sequelize"
import { query } from "../../config/database"
import { Persona } from "../../models/sequelize/Persona"
import { Usuario } from "../../models/sequelize/Usuario"
import { NotFoundError } from "../../utils/AppError"

const handleSequelizeValidationError = (res: Response, error: ValidationError) =>
  res.status(400).json({
    success: false,
    message: "Error de validacion de dominio",
    errors: error.errors.map((e) => ({
      field: e.path,
      message: e.message,
    })),
  })

export const validateCreateUserDomain = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const personaId = Number(req.params.personaId)
    const { user } = req.body

    const hashedPassword = await bcrypt.hash(user.contraseña, 10)

    await Usuario.build({
      persona_id: personaId,
      username: user.username,
      email: user.email,
      contraseña: hashedPassword,
      activo: user.activo ?? true,
    }).validate()

    return next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return handleSequelizeValidationError(res, error)
    }

    return next(error)
  }
}

export const validateCreateUserWithPersonaDomain = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, persona } = req.body
    const hashedPassword = await bcrypt.hash(user.contraseña, 10)

    await Usuario.build({
      persona_id: 1,
      username: user.username,
      email: user.email,
      contraseña: hashedPassword,
      activo: user.activo ?? true,
    }).validate()

    await Persona.build(persona).validate()

    return next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return handleSequelizeValidationError(res, error)
    }

    return next(error)
  }
}

export const validateResetPasswordDomain = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const personaId = Number(req.params.id)
    const personaResult = await query("SELECT persona_id FROM personas WHERE persona_id = $1", [personaId])

    if (personaResult.rows.length === 0) {
      throw new NotFoundError("Persona no encontrada")
    }

    return next()
  } catch (error) {
    return next(error)
  }
}
