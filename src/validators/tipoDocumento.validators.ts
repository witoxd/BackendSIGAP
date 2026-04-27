import { body, param, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createTipoDocumentoHttpValidator: ValidationChain[] = [
  body("tipo_documento.tipo_documento")
    .isString()
    .withMessage("El tipo de documento debe ser texto")
    .notEmpty()
    .withMessage("El tipo de documento es requerido")
    .isLength({ max: 50 })
    .withMessage("El tipo de documento debe tener maximo 50 caracteres"),
  body("tipo_documento.nombre_documento")
    .isString()
    .withMessage("El nombre del documento debe ser texto")
    .notEmpty()
    .withMessage("El nombre del documento es requerido")
    .isLength({ max: 50 })
    .withMessage("El nombre del documento debe tener maximo 50 caracteres"),
]

export const updateTipoDocumentoHttpValidator: ValidationChain[] = [
  body("tipo_documento.tipo_documento")
    .optional()
    .isString()
    .withMessage("El tipo de documento debe ser texto")
    .isLength({ max: 50 })
    .withMessage("El tipo de documento debe tener maximo 50 caracteres"),
  body("tipo_documento.nombre_documento")
    .optional()
    .isString()
    .withMessage("El nombre del documento debe ser texto")
    .isLength({ max: 50 })
    .withMessage("El nombre del documento debe tener maximo 50 caracteres"),
]

// Legacy exports for backward compatibility
export const createTipoDocumentoValidator = createTipoDocumentoHttpValidator
export const updateTipoDocumentoValidator = updateTipoDocumentoHttpValidator

export const tipoDocumentoIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID invalido")
]
