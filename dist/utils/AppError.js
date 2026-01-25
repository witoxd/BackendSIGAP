"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, errors) {
        super(message, 400, errors);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = "No autorizado") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Acceso prohibido") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = "Recurso no encontrado") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = "Conflicto con recurso existente") {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class DatabaseError extends AppError {
    constructor(message = "Error en la base de datos") {
        super(message, 500);
    }
}
exports.DatabaseError = DatabaseError;
//# sourceMappingURL=AppError.js.map