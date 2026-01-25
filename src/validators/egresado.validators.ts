import { body, param, query, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createEgresadoHttpValidator: ValidationChain[] = [
  body("egresado.estudiante_id")
    .isInt({ min: 1 })
    .withMessage("El ID de estudiante es requerido y debe ser un numero valido"),
  body("egresado.fecha_grado")
    .optional()
    .isISO8601()
    .withMessage("La fecha de grado debe ser una fecha valida"),
]

export const updateEgresadoHttpValidator: ValidationChain[] = [
  body("egresado.estudiante_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de estudiante debe ser un numero valido"),
  body("egresado.fecha_grado")
    .optional()
    .isISO8601()
    .withMessage("La fecha de grado debe ser una fecha valida"),
]

// Legacy exports for backward compatibility
export const createEgresadoValidator = createEgresadoHttpValidator
export const updateEgresadoValidator = updateEgresadoHttpValidator

export const egresadoIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID invalido")
]

export const searchEgresadoValidator: ValidationChain[] = [
  query("year").optional().isInt({ min: 1900, max: 2100 }).withMessage("Ano invalido"),
  query("page").optional().isInt({ min: 1 }).withMessage("Pagina debe ser un numero positivo"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limite debe estar entre 1 y 100"),
]
