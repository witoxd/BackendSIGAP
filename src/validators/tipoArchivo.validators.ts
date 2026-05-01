import { body, param, query, type ValidationChain } from "express-validator"

// HTTP Validators para TipoArchivo
export const createTipoArchivoHttpValidator: ValidationChain[] = [
  body("tipo_archivo")
    .isObject()
    .withMessage("El objeto tipo_archivo es requerido"),
  body("tipo_archivo.nombre")
    .isString()
    .withMessage("El nombre debe ser texto")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre debe tener máximo 100 caracteres"),
  body("tipo_archivo.descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto"),
  body("tipo_archivo.extensiones_permitidas")
    .optional()
    .isArray()
    .withMessage("extensiones_permitidas debe ser un array"),
  body("tipo_archivo.extensiones_permitidas.*")
    .optional()
    .isString()
    .withMessage("Cada extensión debe ser texto")
    .matches(/^\.[a-z0-9]+$/i)
    .withMessage("Formato de extensión inválido (debe ser .ext)"),
  body("tipo_archivo.activo")
    .optional()
    .isBoolean()
    .withMessage("activo debe ser booleano"),
  body("tipo_archivo.aplica_a")
    .optional()
    .isArray()
    .withMessage("aplica_a debe ser un array"),
  body("tipo_archivo.aplica_a.*")
    .optional()
    .isIn(["estudiante", "profesor", "administrativo", "acudiente", "matricula"])
    .withMessage("Contexto inválido en aplica_a"),
  body("tipo_archivo.requerido_en")
    .optional()
    .isArray()
    .withMessage("requerido_en debe ser un array"),
  body("tipo_archivo.requerido_en.*")
    .optional()
    .isIn(["estudiante", "profesor", "administrativo", "acudiente", "matricula"])
    .withMessage("Contexto inválido en requerido_en"),
]

export const updateTipoArchivoHttpValidator: ValidationChain[] = [
  body("tipo_archivo")
    .isObject()
    .withMessage("El objeto tipo_archivo es requerido"),
  body("tipo_archivo.nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .isLength({ max: 100 })
    .withMessage("El nombre debe tener máximo 100 caracteres"),
  body("tipo_archivo.descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto"),
  body("tipo_archivo.extensiones_permitidas")
    .optional()
    .isArray()
    .withMessage("extensiones_permitidas debe ser un array"),
  body("tipo_archivo.extensiones_permitidas.*")
    .optional()
    .isString()
    .withMessage("Cada extensión debe ser texto")
    .matches(/^\.[a-z0-9]+$/i)
    .withMessage("Formato de extensión inválido (debe ser .ext)"),
  body("tipo_archivo.activo")
    .optional()
    .isBoolean()
    .withMessage("activo debe ser booleano"),
  body("tipo_archivo.aplica_a")
    .optional()
    .isArray()
    .withMessage("aplica_a debe ser un array"),
  body("tipo_archivo.aplica_a.*")
    .optional()
    .isIn(["estudiante", "profesor", "administrativo", "acudiente", "matricula"])
    .withMessage("Contexto inválido en aplica_a"),
  body("tipo_archivo.requerido_en")
    .optional()
    .isArray()
    .withMessage("requerido_en debe ser un array"),
  body("tipo_archivo.requerido_en.*")
    .optional()
    .isIn(["estudiante", "profesor", "administrativo", "acudiente", "matricula"])
    .withMessage("Contexto inválido en requerido_en"),
]

export const tipoArchivoIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
]

export const tipoArchivoRolValidator: ValidationChain[] = [
  param("rol")
    .isString()
    .notEmpty()
    .withMessage("El rol es requerido")
    .isIn(["estudiante", "acudiente", "profesor", "administrativo", "matricula", null])
    .withMessage("Rol inválido"),
]

export const tipoArchivoNombreValidator: ValidationChain[] = [
  param("nombre")
    .isString()
    .notEmpty()
    .withMessage("Nombre es requerido"),
]

export const checkExtensionValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  query("extension")
    .isString()
    .notEmpty()
    .withMessage("La extensión es requerida")
    .matches(/^\.[a-z0-9]+$/i)
    .withMessage("Formato de extensión inválido (debe ser .ext)"),
]

// Legacy exports
export const createTipoArchivoValidator = createTipoArchivoHttpValidator
export const updateTipoArchivoValidator = updateTipoArchivoHttpValidator
