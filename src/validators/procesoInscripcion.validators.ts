import { body, param, type ValidationChain } from "express-validator"

export const createProcesoInscripcionValidator: ValidationChain[] = [
  body("proceso").isObject().withMessage("El objeto proceso es requerido"),
  body("proceso.periodo_id")
    .isInt({ min: 1 })
    .withMessage("periodo_id debe ser un entero positivo"),
  body("proceso.nombre")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres"),
  body("proceso.fecha_inicio_inscripcion")
    .isISO8601()
    .withMessage("fecha_inicio_inscripcion debe ser una fecha válida (YYYY-MM-DD)"),
  body("proceso.fecha_fin_inscripcion")
    .isISO8601()
    .withMessage("fecha_fin_inscripcion debe ser una fecha válida (YYYY-MM-DD)"),
  body("proceso.activo")
    .optional()
    .isBoolean()
    .withMessage("activo debe ser un booleano"),
]

export const updateProcesoInscripcionValidator: ValidationChain[] = [
  body("proceso").isObject().withMessage("El objeto proceso es requerido"),
  body("proceso.periodo_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("periodo_id debe ser un entero positivo"),
  body("proceso.nombre")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres"),
  body("proceso.fecha_inicio_inscripcion")
    .optional()
    .isISO8601()
    .withMessage("fecha_inicio_inscripcion debe ser una fecha válida (YYYY-MM-DD)"),
  body("proceso.fecha_fin_inscripcion")
    .optional()
    .isISO8601()
    .withMessage("fecha_fin_inscripcion debe ser una fecha válida (YYYY-MM-DD)"),
  body("proceso.activo")
    .optional()
    .isBoolean()
    .withMessage("activo debe ser un booleano"),
]

export const procesoInscripcionIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID de proceso inválido"),
]

export const periodoIdParamValidator: ValidationChain[] = [
  param("periodoId").isInt({ min: 1 }).withMessage("ID de período inválido"),
]
