import { body, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createEstudianteHttpValidator: ValidationChain[] = [
  body("estudiante")
    .isObject()
    .withMessage("El objeto estudiante es requerido"),
  body("persona")
    .isObject()
    .withMessage("El objeto persona es requerido"),
  body("estudiante.jornada_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de jornada debe ser un numero valido"),
  body("estudiante.estado")
    .optional()
    .isIn(["activo", "inactivo", "graduado", "suspendido", "expulsado"])
    .withMessage("El estado debe ser activo, inactivo, graduado, suspendido o expulsado"),
  body("estudiante.fecha_ingreso")
    .optional()
    .isISO8601()
    .withMessage("La fecha de ingreso debe ser una fecha valida"),
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

export const updateEstudianteHttpValidator: ValidationChain[] = [
  body("estudiante")
    .optional()
    .isObject()
    .withMessage("El objeto estudiante debe ser un objeto"),
  body("persona")
    .optional()
    .isObject()
    .withMessage("El objeto persona debe ser un objeto"),
  body("estudiante.jornada_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de jornada debe ser un numero valido"),
  body("estudiante.estado")
    .optional()
    .isIn(["activo", "inactivo", "graduado", "suspendido", "expulsado"])
    .withMessage("El estado debe ser activo, inactivo, graduado, suspendido o expulsado"),
  body("estudiante.fecha_ingreso")
    .optional()
    .isISO8601()
    .withMessage("La fecha de ingreso debe ser una fecha valida"),
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
export const createEstudianteValidator = createEstudianteHttpValidator
export const updateEstudianteValidator = updateEstudianteHttpValidator
