import { body, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createProfesorHttpValidator: ValidationChain[] = [
  body("profesor")
    .isObject()
    .withMessage("El objeto profesor es requerido"),
  body("persona")
    .isObject()
    .withMessage("El objeto persona es requerido"),
  body("profesor.fecha_contratacion")
    .optional()
    .isISO8601()
    .withMessage("La fecha de contratacion debe ser una fecha valida"),
  body("profesor.estado")
    .optional()
    .isIn(["activo", "inactivo"])
    .withMessage("El estado debe ser activo o inactivo"),
  // Persona fields
  body("persona.nombres")
    .isString()
    .withMessage("Los nombres deben ser texto")
    .notEmpty()
    .withMessage("Los nombres son requeridos"),
  body("persona.apellido_paterno")
    .optional()
    .isString()
    .withMessage("El apellido paterno debe ser texto"),
  body("persona.apellido_materno")
    .optional()
    .isString()
    .withMessage("El apellido materno debe ser texto"),
  body("persona.tipo_documento_id")
    .isInt({ min: 1 })
    .withMessage("El tipo de documento es requerido"),
  body("persona.numero_documento")
    .isString()
    .withMessage("El numero de documento debe ser texto")
    .notEmpty()
    .withMessage("El numero de documento es requerido"),
  body("persona.fecha_nacimiento")
    .isISO8601()
    .withMessage("La fecha de nacimiento debe ser una fecha valida"),
  body("persona.genero")
    .isIn(["Masculino", "Femenino", "Otro"])
    .withMessage("El genero debe ser Masculino, Femenino u Otro"),
]

export const updateProfesorHttpValidator: ValidationChain[] = [
  body("profesor")
    .optional()
    .isObject()
    .withMessage("El objeto profesor debe ser un objeto"),
  body("persona")
    .optional()
    .isObject()
    .withMessage("El objeto persona debe ser un objeto"),
  body("profesor.fecha_contratacion")
    .optional()
    .isISO8601()
    .withMessage("La fecha de contratacion debe ser una fecha valida"),
  body("profesor.estado")
    .optional()
    .isIn(["activo", "inactivo"])
    .withMessage("El estado debe ser activo o inactivo"),
  // Persona fields (optional for update)
  body("persona.nombres")
    .optional()
    .isString()
    .withMessage("Los nombres deben ser texto"),
  body("persona.apellido_paterno")
    .optional()
    .isString()
    .withMessage("El apellido paterno debe ser texto"),
  body("persona.apellido_materno")
    .optional()
    .isString()
    .withMessage("El apellido materno debe ser texto"),
]

// Legacy exports for backward compatibility
export const createProfesorValidator = createProfesorHttpValidator
export const updateProfesorValidator = updateProfesorHttpValidator
