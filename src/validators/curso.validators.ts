import { body, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createCursoHttpValidator: ValidationChain[] = [
  body("curso.nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .isLength({ max: 100 })
    .withMessage("El nombre debe tener maximo 100 caracteres"),
  body("curso.grado")
    .isString()
    .withMessage("El grado debe ser texto")
    .notEmpty()
    .withMessage("El grado es requerido")
    .isLength({ max: 20 })
    .withMessage("El grado debe tener maximo 20 caracteres"),

]

export const updateCursoHttpValidator: ValidationChain[] = [
  body("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .isLength({ max: 100 })
    .withMessage("El nombre debe tener maximo 100 caracteres"),
  body("grado")
    .optional()
    .isString()
    .withMessage("El grado debe ser texto")
    .isLength({ max: 20 })
    .withMessage("El grado debe tener maximo 20 caracteres"),
]

// Legacy exports for backward compatibility
export const createCursoValidator = createCursoHttpValidator
export const updateCursoValidator = updateCursoHttpValidator
