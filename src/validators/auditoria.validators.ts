import { body, param, query, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
// Auditoria is typically read-only, but validators included for completeness
export const createAuditoriaHttpValidator: ValidationChain[] = [
  body("tabla_nombre")
    .isString()
    .withMessage("El nombre de tabla debe ser texto")
    .notEmpty()
    .withMessage("El nombre de tabla es requerido")
    .isLength({ max: 50 })
    .withMessage("El nombre de tabla debe tener maximo 50 caracteres"),
  body("accion")
    .isString()
    .withMessage("La accion debe ser texto")
    .notEmpty()
    .withMessage("La accion es requerida")
    .isLength({ max: 50 })
    .withMessage("La accion debe tener maximo 50 caracteres"),
  body("usuario_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de usuario debe ser un numero valido"),
  body("fecha")
    .optional()
    .isISO8601()
    .withMessage("La fecha debe ser una fecha valida"),
  body("detalle")
    .optional()
    .isObject()
    .withMessage("El detalle debe ser un objeto"),
]

export const updateAuditoriaHttpValidator: ValidationChain[] = [
  body("tabla_nombre")
    .optional()
    .isString()
    .withMessage("El nombre de tabla debe ser texto")
    .isLength({ max: 50 })
    .withMessage("El nombre de tabla debe tener maximo 50 caracteres"),
  body("accion")
    .optional()
    .isString()
    .withMessage("La accion debe ser texto")
    .isLength({ max: 50 })
    .withMessage("La accion debe tener maximo 50 caracteres"),
  body("usuario_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de usuario debe ser un numero valido"),
  body("fecha")
    .optional()
    .isISO8601()
    .withMessage("La fecha debe ser una fecha valida"),
  body("detalle")
    .optional()
    .isObject()
    .withMessage("El detalle debe ser un objeto"),
]

// Legacy exports for backward compatibility
export const createAuditoriaValidator = createAuditoriaHttpValidator
export const updateAuditoriaValidator = updateAuditoriaHttpValidator

export const auditoriaIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID invalido")
]

export const searchAuditoriaValidator: ValidationChain[] = [
  query("usuario_id").optional().isInt({ min: 1 }).withMessage("usuario_id debe ser un numero positivo"),
  query("accion").optional().isIn(["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"]).withMessage("Accion invalida"),
  query("tabla").optional().isLength({ min: 1, max: 100 }).withMessage("Tabla invalida"),
  query("page").optional().isInt({ min: 1 }).withMessage("Pagina debe ser un numero positivo"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limite debe estar entre 1 y 100"),
]
