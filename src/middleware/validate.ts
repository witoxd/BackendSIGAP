import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import { ValidationError } from "../utils/AppError"

// onlyFirstError: true — devuelve solo el primer error por campo.
// Sin esto, un campo con 3 validaciones fallidas genera 3 mensajes para el mismo, genera mucho ruido

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array({ onlyFirstError: true }).map((err) => ({
      field:   err.type === "field" ? err.path : "general",
      message: err.msg,
    }))

    return next(new ValidationError("Errores de validación", formattedErrors))
  }

  next()
}
