import { body, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createRoleHttpValidator: ValidationChain[] = [
  body("nombre")
    .isString()
    .withMessage("El nombre debe ser texto")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre debe tener máximo 100 caracteres")
    .matches(/^[a-z0-9_]+$/)
    .withMessage("El nombre solo puede contener letras minúsculas, números y guiones bajos"),
  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripcion debe ser texto")
    .isLength({ max: 255 })
    .withMessage("La descripcion debe tener maximo 255 caracteres"),
]

export const updateRoleHttpValidator: ValidationChain[] = [
  body("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .trim()
    .isLength({ max: 100 })
    .withMessage("El nombre debe tener máximo 100 caracteres")
    .matches(/^[a-z0-9_]+$/)
    .withMessage("El nombre solo puede contener letras minúsculas, números y guiones bajos"),
  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripcion debe ser texto")
    .isLength({ max: 255 })
    .withMessage("La descripcion debe tener maximo 255 caracteres"),
]

// Legacy exports for backward compatibility
export const createRoleValidator = createRoleHttpValidator
export const updateRoleValidator = updateRoleHttpValidator
