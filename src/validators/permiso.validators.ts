import { body, param, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createPermisoHttpValidator: ValidationChain[] = [
  body("nombre")
    .isString()
    .withMessage("El nombre debe ser texto")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 50 })
    .withMessage("El nombre debe tener maximo 50 caracteres"),
  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripcion debe ser texto"),
  body("recurso")
    .isString()
    .withMessage("El recurso debe ser texto")
    .notEmpty()
    .withMessage("El recurso es requerido"),
  body("accion")
    .isString()
    .withMessage("La accion debe ser texto")
    .notEmpty()
    .withMessage("La accion es requerida"),
]

export const updatePermisoHttpValidator: ValidationChain[] = [
  body("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .isLength({ max: 50 })
    .withMessage("El nombre debe tener maximo 50 caracteres"),
  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripcion debe ser texto"),
  body("recurso")
    .optional()
    .isString()
    .withMessage("El recurso debe ser texto"),
  body("accion")
    .optional()
    .isString()
    .withMessage("La accion debe ser texto"),
]

// Legacy exports for backward compatibility
export const createPermisoValidator = createPermisoHttpValidator
export const updatePermisoValidator = updatePermisoHttpValidator

export const assignPermisoValidator: ValidationChain[] = [
  body("role_id").isInt({ min: 1 }).withMessage("role_id debe ser un numero positivo"),
  body("permiso_id").isInt({ min: 1 }).withMessage("permiso_id debe ser un numero positivo"),
]

export const permisoIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID invalido")
]
