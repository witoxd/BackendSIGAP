import { body, param, query, type ValidationChain } from "express-validator"

// ============================================================================
// VALIDADORES HTTP PARA ARCHIVOS (form-data)
// ============================================================================
// NOTA: Los campos vienen en form-data (no en JSON anidado)
// porque se usa multer para subida de archivos.
// El campo "url_archivo" NO se valida aqui porque se genera
// automaticamente desde el archivo subido por multer.

/**
 * Validador HTTP para crear archivo
 */
export const createArchivoHttpValidator: ValidationChain[] = [
  body("persona_id")
    .notEmpty()
    .withMessage("El ID de persona es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID de persona debe ser un entero positivo"),

  body("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .isLength({ max: 200 })
    .withMessage("El nombre no puede exceder 200 caracteres"),

  body("metadata.descripcion")
    .optional()
    .isString()
    .withMessage("La descripcion debe ser texto"),

  body("metadata.tipo_archivo_id")
    .optional()
    // .withMessage("El tipo de archivo es requerido")
    .isInt({ min: 1 })
    .withMessage("Tipo de archivo invalido)"),
]

/**
 * Validador HTTP para actualizar archivo
 * Todos los campos son opcionales en actualizacion
 */
export const updateArchivoHttpValidator: ValidationChain[] = [
  body("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .isLength({ max: 200 })
    .withMessage("El nombre no puede exceder 200 caracteres"),

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripcion debe ser texto"),

  body("tipo_archivo")
    .optional()
    .isIn(["certificado", "diploma", "constancia", "carta", "otro"])
    .withMessage("Tipo de archivo invalido. Valores permitidos: certificado, diploma, constancia, carta, otro"),

  body("activo")
    .optional()
    .custom((value) => {
      // En form-data, los booleanos pueden venir como strings
      if (value === "true" || value === "false" || typeof value === "boolean") {
        return true
      }
      throw new Error("El campo activo debe ser booleano")
    }),
]

// ============================================================================
// VALIDADORES ADICIONALES
// ============================================================================

export const archivoIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
]

export const searchArchivoValidator: ValidationChain[] = [
  query("tipo_archivo")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Tipo de archivo invalido"),
  query("persona_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("persona_id debe ser un numero positivo"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Pagina debe ser un numero positivo"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limite debe estar entre 1 y 100"),
]

// ============================================================================
// EXPORTACIONES DE COMPATIBILIDAD (legacy)
// ============================================================================

export const createArchivoValidator = createArchivoHttpValidator
export const updateArchivoValidator = updateArchivoHttpValidator

export const archivoValidators = {
  createArchivoHttpValidator,
  updateArchivoHttpValidator,
  archivoIdValidator,
  searchArchivoValidator,
}
