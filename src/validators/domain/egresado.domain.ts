import type { Request, Response, NextFunction } from "express"
import { Egresado } from "../../models/sequelize/Egresado"
import { ValidationError } from "sequelize"

export const validateCreateEgresadoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {egresado: EgresadoData} = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Egresado.build(EgresadoData).validate()

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

export const validateUpdateEgresadoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const egresado = req.body

    await Egresado.build(egresado).validate({ skip: ["estudiante_id"] })

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
