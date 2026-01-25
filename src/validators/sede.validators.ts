import { body, param, query, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createSedeHttpValidator: ValidationChain[] = [
  body("nombre")
    .isString()
    .withMessage("El nombre debe ser texto")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre debe tener maximo 100 caracteres"),
  body("direccion")
    .optional()
    .isString()
    .withMessage("La direccion debe ser texto")
    .isLength({ max: 100 })
    .withMessage("La direccion debe tener maximo 100 caracteres"),
]

export const updateSedeHttpValidator: ValidationChain[] = [
  body("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .isLength({ max: 100 })
    .withMessage("El nombre debe tener maximo 100 caracteres"),
  body("direccion")
    .optional()
    .isString()
    .withMessage("La direccion debe ser texto")
    .isLength({ max: 100 })
    .withMessage("La direccion debe tener maximo 100 caracteres"),
]

// Legacy exports for backward compatibility
export const createSedeValidator = createSedeHttpValidator
export const updateSedeValidator = updateSedeHttpValidator

export const sedeIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID invalido")
]

export const searchSedeValidator: ValidationChain[] = [
  query("nombre").optional().isLength({ min: 1, max: 100 }).withMessage("Nombre invalido"),
  query("page").optional().isInt({ min: 1 }).withMessage("Pagina debe ser un numero positivo"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limite debe estar entre 1 y 100"),
]
