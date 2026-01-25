import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import { AppError } from "../utils/AppError"

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.type === "field" ? error.path : "unknown",
      message: error.msg,
    }))

    throw new AppError("Errores de validación", 400, errorMessages)
  }

  next()
}
