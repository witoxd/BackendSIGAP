import type { Request, Response, NextFunction } from "express"
import { Contacto } from "../../models/sequelize/Contacto"
import { ValidationError } from "sequelize"

export const validateCreateContactoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contacto: ContactoData } = req.body

    // Validación dominio con Sequelize (NO DB)
    await Contacto.build(ContactoData).validate({ skip: ["persona_id"] })

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      })
    }

    next(error)
  }
}

export const validateUpdateContactoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contacto: ContactoData } = req.body

    if (ContactoData && Object.keys(ContactoData).length > 0) {
      await Contacto.build(ContactoData).validate({
        skip: ["contacto_id", "persona_id"],
      })
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      })
    }

    next(error)
  }
}

export const validateBulkCreateContactoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contactos } = req.body

    if (!Array.isArray(contactos) || contactos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de contactos",
      })
    }

    // Validar cada contacto
    for (let i = 0; i < contactos.length; i++) {
      await Contacto.build(contactos[i]).validate({ skip: ["persona_id"] })
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      })
    }

    next(error)
  }
}
