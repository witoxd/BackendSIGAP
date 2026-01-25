import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/AppError"

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  // Log del error
  console.error("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString(),
  })

  // Error operacional (AppError)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
  }

  // Error de base de datos (timeout, conexión, etc.)
  if (err.message.includes("timeout") || err.message.includes("connection")) {
    return res.status(503).json({
      success: false,
      message: "El servicio está temporalmente no disponible. Por favor, intente nuevamente.",
      code: "SERVICE_UNAVAILABLE",
    })
  }

  // Error de sintaxis SQL
  if (err.message.includes("syntax error") || err.message.includes("invalid input")) {
    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud. Por favor, contacte al administrador.",
      code: "DATABASE_ERROR",
    })
  }

  // Error no manejado (500)
  return res.status(500).json({
    success: false,
    message: "Ha ocurrido un error interno del servidor. Por favor, intente nuevamente.",
    code: "INTERNAL_SERVER_ERROR",
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  })
}
