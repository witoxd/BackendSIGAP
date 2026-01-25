import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import { ValidationError } from "../utils/AppError"

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.type === "field" ? err.path : "unknown",
      message: err.msg,
    }))

    return next(new ValidationError("Errores de validación", formattedErrors))
  }

  next()
}
