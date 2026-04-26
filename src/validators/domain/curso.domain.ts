import type { Request, Response, NextFunction } from "express"
import { Curso } from "../../models/sequelize/Curso"
import { ValidationError } from "sequelize"

export const validateCreateCursoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {curso: CursoData} = req.body

    // Validacion dominio con Sequelize (NO DB)
    await Curso.build(CursoData).validate()

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

export const validateUpdateCursoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
     const {curso: CursoData} = req.body

    await Curso.build(CursoData).validate()

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
