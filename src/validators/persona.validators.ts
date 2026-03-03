import { body, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request

export const personaBaseHttpValidator: ValidationChain[] = [
  body("persona.numero_documento")
    .isString()
    .withMessage("El numero de documento debe ser texto")
    .notEmpty()
    .withMessage("El numero de documento es requerido")
]

export const createPersonaHttpValidator: ValidationChain[] = [
  body("persona.nombres")
    .isString()
    .withMessage("Los nombres deben ser texto")
    .notEmpty()
    .withMessage("Los nombres son requeridos")
    .isLength({ min: 2, max: 100 })
    .withMessage("Los nombres deben tener entre 2 y 100 caracteres"),
  body("persona.apellido_paterno")
    .optional()
    .isString()
    .withMessage("El apellido paterno debe ser texto")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido paterno debe tener entre 2 y 50 caracteres"),
  body("persona.apellido_materno")
    .optional()
    .isString()
    .withMessage("El apellido materno debe ser texto")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido materno debe tener entre 2 y 50 caracteres"),
  body("persona.tipo_documento_id")
    .isInt({ min: 1 })
    .withMessage("El tipo de documento es requerido y debe ser un numero valido"),
  body("persona.numero_documento")
    .isString()
    .withMessage("El numero de documento debe ser texto")
    .notEmpty()
    .withMessage("El numero de documento es requerido")
    .isLength({ min: 5, max: 20 })
    .withMessage("El numero de documento debe tener entre 5 y 20 caracteres"),
  body("persona.fecha_nacimiento")
    .isISO8601()
    .withMessage("La fecha de nacimiento debe ser una fecha valida"),
  body("persona.genero")
    .isIn(["Masculino", "Femenino", "Otro"])
    .withMessage("El genero debe ser Masculino, Femenino u Otro"),
]

export const updatePersonaHttpValidator: ValidationChain[] = [
  body("persona.nombres")
    .optional()
    .isString()
    .withMessage("Los nombres deben ser texto")
    .isLength({ min: 2, max: 100 })
    .withMessage("Los nombres deben tener entre 2 y 100 caracteres"),
  body("persona.apellido_paterno")
    .optional()
    .isString()
    .withMessage("El apellido paterno debe ser texto")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido paterno debe tener entre 2 y 50 caracteres"),
  body("persona.apellido_materno")
    .optional()
    .isString()
    .withMessage("El apellido materno debe ser texto")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido materno debe tener entre 2 y 50 caracteres"),
  body("persona.tipo_documento_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El tipo de documento debe ser un numero valido"),
  body("persona.numero_documento")
    .optional()
    .isString()
    .withMessage("El numero de documento debe ser texto")
    .isLength({ min: 5, max: 20 })
    .withMessage("El numero de documento debe tener entre 5 y 20 caracteres"),
  body("persona.fecha_nacimiento")
    .optional()
    .isISO8601()
    .withMessage("La fecha de nacimiento debe ser una fecha valida"),
  body("persona.genero")
    .optional()
    .isIn(["Masculino", "Femenino", "Otro"])
    .withMessage("El genero debe ser Masculino, Femenino u Otro"),
]

// Legacy exports for backward compatibility
export const createPersonaValidator = createPersonaHttpValidator
export const updatePersonaValidator = updatePersonaHttpValidator
export const personaBaseValidator = personaBaseHttpValidator