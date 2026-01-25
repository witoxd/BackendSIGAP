export class AppError extends Error {
  statusCode: number
  isOperational: boolean
  errors?: any[]

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.errors = errors

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: any[]) {
    super(message, 400, errors)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto con recurso existente") {
    super(message, 409)
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Error en la base de datos") {
    super(message, 500)
  }
}
