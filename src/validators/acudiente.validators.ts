import { body, param, query, type ValidationChain } from "express-validator"
import { personaBaseHttpValidator, updatePersonaHttpValidator } from "./persona.validators"


// HTTP Validators - Validacion de estructura de request
export const createAcudienteHttpValidator: ValidationChain[] = [
  body("acudiente")
    .isObject()
    .withMessage("El objeto acudiente es requerido"),
  body("persona")
    .isObject()
    .withMessage("El objeto persona es requerido"),
  body("acudiente.parentesco")
    .optional()
    .isString()
    .withMessage("El parentesco debe ser texto")
    .isLength({ max: 50 })
    .withMessage("El parentesco debe tener maximo 50 caracteres"),
]

export const updateAcudienteHttpValidator: ValidationChain[] = [
  body("acudiente")
    .optional()
    .isObject()
    .withMessage("El objeto acudiente debe ser un objeto"),
  body("persona")
    .optional()
    .isObject()
    .withMessage("El objeto persona debe ser un objeto"),
  body("acudiente.parentesco")
    .optional()
    .isString()
    .withMessage("El parentesco debe ser texto")
    .isLength({ max: 50 })
    .withMessage("El parentesco debe tener maximo 50 caracteres"),
]

export const CreateAcudienteHttpValidator = [
  ...createAcudienteHttpValidator,
  ...personaBaseHttpValidator
]

export const UpdateAcudienteHttpValidator = [
...updatePersonaHttpValidator,
...updateAcudienteHttpValidator

]

export const assignAcudienteHttpValidator: ValidationChain[] = [
  body("assignToEstudiante.estudiante_id")
    .isInt({ min: 1 })
    .withMessage("estudiante_id debe ser un numero positivo"),
  body("assignToEstudiante.acudiente_id")
    .isInt({ min: 1 })
    .withMessage("acudiente_id debe ser un numero positivo"),
    body("assignToEstudiante.tipo_relacion")
    .isString()
    .withMessage("Tiene que haber un tipo de relacion"),
    body("assignToEstudiante.es_principal")
    .isBoolean()
    .withMessage("Debe ser verdadero o falso si es el acudiente principal")
]

export const removeEstudianteToAcudienteHttpValidator: ValidationChain[] = [
  param("estudianteId")
    .isInt({ min: 1 })
    .withMessage("estudiante_id debe ser un numero positivo"),
  param("acudienteId")
    .isInt({ min: 1 })
    .withMessage("acudiente_id debe ser un numero positivo"),
]

// Legacy exports for backward compatibility
export const createAcudienteValidator = CreateAcudienteHttpValidator
export const updateAcudienteValidator = updateAcudienteHttpValidator
export const assignAcudienteValidator = assignAcudienteHttpValidator

export const acudienteIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID invalido")
]

export const searchAcudienteValidator: ValidationChain[] = [
  query("estudiante_id").optional().isInt({ min: 1 }).withMessage("estudiante_id debe ser un numero positivo"),
  query("page").optional().isInt({ min: 1 }).withMessage("Pagina debe ser un numero positivo"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limite debe estar entre 1 y 100"),
]
