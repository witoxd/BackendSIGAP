import type { Request, Response, NextFunction } from "express"
import { Matricula } from "../../models/sequelize/Matricula"
import { ValidationError } from "sequelize"

export const validateCreateMatriculaDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {matricula: MatriculaData} = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Matricula.build(MatriculaData).validate()

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

export const validateUpdateMatriculaDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {matricula: MatriculaData} = req.body

    await Matricula.build(MatriculaData).validate({ skip: ["estudiante_id", "curso_id", "profesor_id", "jornada_id"] })

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
