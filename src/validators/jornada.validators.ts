import { body, param, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createJornadaHttpValidator: ValidationChain[] = [
  body("nombre")
    .isString()
    .withMessage("El nombre debe ser texto")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 50 })
    .withMessage("El nombre debe tener maximo 50 caracteres"),
  body("hora_inicio")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage("La hora de inicio debe tener formato HH:MM o HH:MM:SS"),
  body("hora_fin")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage("La hora de fin debe tener formato HH:MM o HH:MM:SS"),
]

export const updateJornadaHttpValidator: ValidationChain[] = [
  body("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .isLength({ max: 50 })
    .withMessage("El nombre debe tener maximo 50 caracteres"),
  body("hora_inicio")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage("La hora de inicio debe tener formato HH:MM o HH:MM:SS"),
  body("hora_fin")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage("La hora de fin debe tener formato HH:MM o HH:MM:SS"),
]

// Legacy exports for backward compatibility
export const createJornadaValidator = createJornadaHttpValidator
export const updateJornadaValidator = updateJornadaHttpValidator

export const jornadaIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID invalido")
]
