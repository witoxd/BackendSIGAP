import { body, type ValidationChain } from "express-validator"

const NIVELES_VALIDOS = ["Preescolar", "Primaria", "Secundaria", "Media"]

export const createCursoHttpValidator: ValidationChain[] = [
  body("curso.grado")
    .isString().notEmpty().withMessage("El grado es requerido")
    .isLength({ max: 20 }).withMessage("El grado debe tener máximo 20 caracteres"),
  body("curso.nivel")
    .isIn(NIVELES_VALIDOS).withMessage(`El nivel debe ser uno de: ${NIVELES_VALIDOS.join(", ")}`),
  body("curso.grupo")
    .isString().notEmpty().withMessage("El grupo es requerido")
    .isLength({ max: 10 }).withMessage("El grupo debe tener máximo 10 caracteres"),
  body("curso.jornada_id")
    .isInt({ min: 1 }).withMessage("jornada_id requerido y debe ser un entero positivo"),
  body("curso.capacidad_maxima")
    .optional()
    .isInt({ min: 1 }).withMessage("La capacidad máxima debe ser un entero positivo"),
]

export const updateCursoHttpValidator: ValidationChain[] = [
  body("curso.grado")
    .optional()
    .isString().isLength({ max: 20 }).withMessage("El grado debe tener máximo 20 caracteres"),
  body("curso.nivel")
    .optional()
    .isIn(NIVELES_VALIDOS).withMessage(`El nivel debe ser uno de: ${NIVELES_VALIDOS.join(", ")}`),
  body("curso.grupo")
    .optional()
    .isString().isLength({ max: 10 }).withMessage("El grupo debe tener máximo 10 caracteres"),
  body("curso.jornada_id")
    .optional()
    .isInt({ min: 1 }).withMessage("jornada_id debe ser un entero positivo"),
  body("curso.capacidad_maxima")
    .optional()
    .isInt({ min: 1 }).withMessage("La capacidad máxima debe ser un entero positivo"),
  body("curso.activo")
    .optional()
    .isBoolean().withMessage("activo debe ser booleano"),
]

export const createCursoValidator = createCursoHttpValidator
export const updateCursoValidator = updateCursoHttpValidator
