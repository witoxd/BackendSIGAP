import { body, param, type ValidationChain } from "express-validator"

// =============================================================================
// PERIODO MATRICULA
// =============================================================================

export const createPeriodoMatriculaHttpValidator: ValidationChain[] = [
  body("periodo")
    .isObject()
    .withMessage("El objeto periodo es requerido"),
  body("periodo.anio")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("El año debe ser un valor válido entre 2000 y 2100"),
  body("periodo.fecha_inicio")
    .isISO8601()
    .withMessage("fecha_inicio debe ser una fecha válida (YYYY-MM-DD)"),
  body("periodo.fecha_fin")
    .isISO8601()
    .withMessage("fecha_fin debe ser una fecha válida (YYYY-MM-DD)"),
  body("periodo.descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto")
    .isLength({ max: 200 })
    .withMessage("La descripción no puede exceder 200 caracteres"),
]

export const updatePeriodoMatriculaHttpValidator: ValidationChain[] = [
  body("periodo")
    .isObject()
    .withMessage("El objeto periodo es requerido"),
  body("periodo.anio")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("El año debe ser un valor válido entre 2000 y 2100"),
  body("periodo.fecha_inicio")
    .optional()
    .isISO8601()
    .withMessage("fecha_inicio debe ser una fecha válida (YYYY-MM-DD)"),
  body("periodo.fecha_fin")
    .optional()
    .isISO8601()
    .withMessage("fecha_fin debe ser una fecha válida (YYYY-MM-DD)"),
  body("periodo.descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto")
    .isLength({ max: 200 })
    .withMessage("La descripción no puede exceder 200 caracteres"),
]

export const periodoMatriculaIdValidator: ValidationChain[] = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID de período inválido"),
]

// =============================================================================
// MATRICULA ARCHIVO
// =============================================================================

export const asociarArchivoHttpValidator: ValidationChain[] = [
  param("matriculaId")
    .isInt({ min: 1 })
    .withMessage("ID de matrícula inválido"),
  body("archivo_id")
    .isInt({ min: 1 })
    .withMessage("archivo_id debe ser un número entero positivo"),
]

export const asociarArchivosBulkHttpValidator: ValidationChain[] = [
  param("matriculaId")
    .isInt({ min: 1 })
    .withMessage("ID de matrícula inválido"),
  body("archivo_ids")
    .isArray({ min: 1 })
    .withMessage("archivo_ids debe ser un array con al menos un elemento"),
  body("archivo_ids.*")
    .isInt({ min: 1 })
    .withMessage("Cada archivo_id debe ser un número entero positivo"),
]

export const desasociarArchivoHttpValidator: ValidationChain[] = [
  param("matriculaId")
    .isInt({ min: 1 })
    .withMessage("ID de matrícula inválido"),
  param("archivoId")
    .isInt({ min: 1 })
    .withMessage("ID de archivo inválido"),
]

export const matriculaIdParamValidator: ValidationChain[] = [
  param("matriculaId")
    .isInt({ min: 1 })
    .withMessage("ID de matrícula inválido"),
]
