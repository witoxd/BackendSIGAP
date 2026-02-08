import { body, type ValidationChain } from "express-validator"
import { personaBaseHttpValidator, updatePersonaHttpValidator } from "./persona.validators"

// HTTP Validators - Validacion de estructura de request
export const createAdministrativoHttpValidator: ValidationChain[] = [
  body("administrativo")
    .isObject()
    .withMessage("El objeto administrativo es requerido"),
  body("administrativo.cargo")
    .isString()
    .withMessage("El cargo debe ser texto")
    .notEmpty()
    .withMessage("El cargo es requerido"),
  body("administrativo.estado")
    .optional()
    .isBoolean()
    .withMessage("El estado debe ser booleano"),
  body("administrativo.fecha_contratacion")
    .optional()
    .isISO8601()
    .withMessage("La fecha de contratacion debe ser una fecha valida"),
]

export const updateAdministrativoHttpValidator: ValidationChain[] = [
  body("administrativo")
    .optional()
    .isObject()
    .withMessage("El objeto administrativo debe ser un objeto"),
  body("administrativo.cargo")
    .optional()
    .isString()
    .withMessage("El cargo debe ser texto"),
  body("administrativo.estado")
    .optional()
    .isBoolean()
    .withMessage("El estado debe ser booleano"),
  body("administrativo.fecha_contratacion")
    .optional()
    .isISO8601()
    .withMessage("La fecha de contratacion debe ser una fecha valida"),
]

// Legacy exports for backward compatibility
export const createAdministrativoValidator = createAdministrativoHttpValidator
export const updateAdministrativoValidator = updateAdministrativoHttpValidator
