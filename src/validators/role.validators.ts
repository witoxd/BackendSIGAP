import { body, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createRoleHttpValidator: ValidationChain[] = [
  body("nombre")
    .isIn(["admin", "profesor", "estudiante", "administrativo"])
    .withMessage("El nombre debe ser admin, profesor, estudiante o administrativo"),
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
    .isIn(["admin", "profesor", "estudiante", "administrativo"])
    .withMessage("El nombre debe ser admin, profesor, estudiante o administrativo"),
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
