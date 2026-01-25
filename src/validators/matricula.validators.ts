import { body, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createMatriculaHttpValidator: ValidationChain[] = [
  body("matricula.estudiante_id")
    .isInt({ min: 1 })
    .withMessage("El ID de estudiante es requerido y debe ser un numero valido"),
  body("matricula.profesor_id")
    .isInt({ min: 1 })
    .withMessage("El ID de profesor es requerido y debe ser un numero valido"),
  body("matricula.curso_id")
    .isInt({ min: 1 })
    .withMessage("El ID de curso es requerido y debe ser un numero valido"),
  body("matricula.fecha_matricula")
    .optional()
    .isISO8601()
    .withMessage("La fecha de matricula debe ser una fecha valida"),
  body("matricula.estado")
    .optional()
    .isIn(["activa", "finalizada", "retirada"])
    .withMessage("El estado debe ser activa, finalizada o retirada"),
  body("matricula.anio_egreso")
    .optional()
    .isInt({ min: 1900 })
    .withMessage("El año de egreso debe ser valido")
]

export const updateMatriculaHttpValidator: ValidationChain[] = [
  body("matricula.estudiante_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de estudiante debe ser un numero valido"),
  body("matricula.profesor_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de profesor debe ser un numero valido"),
  body("matricula.curso_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de curso debe ser un numero valido"),
  body("matricula.fecha_matricula")
    .optional()
    .isISO8601()
    .withMessage("La fecha de matricula debe ser una fecha valida"),
  body("matricula.estado")
    .optional()
    .isIn(["activa", "finalizada", "retirada"])
    .withMessage("El estado debe ser activa, finalizada o retirada"),
  body("matricula.anio_egreso")
    .optional()
    .isInt({ min: 19000 })
    .withMessage("El año de egreso debe ser valido")
]

// Legacy exports for backward compatibility
export const createMatriculaValidator = createMatriculaHttpValidator
export const updateMatriculaValidator = updateMatriculaHttpValidator
