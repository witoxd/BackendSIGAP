import { body, param, query, type ValidationChain } from "express-validator"

// HTTP Validators para Contacto
export const createContactoHttpValidator: ValidationChain[] = [
  body("contacto")
    .isObject()
    .withMessage("El objeto contacto es requerido"),
  body("contacto.persona_id")
    .isInt({ min: 1 })
    .withMessage("El ID de persona es requerido y debe ser un número válido"),
  body("contacto.tipo_contacto")
    .isIn(["telefono", "celular", "email", "direccion", "otro"])
    .withMessage("Tipo de contacto inválido. Valores permitidos: telefono, celular, email, direccion, otro"),
  body("contacto.valor")
    .isString()
    .withMessage("El valor del contacto debe ser texto")
    .notEmpty()
    .withMessage("El valor del contacto es requerido")
    .isLength({ max: 255 })
    .withMessage("El valor del contacto no puede exceder 255 caracteres"),
  body("contacto.es_principal")
    .optional()
    .isBoolean()
    .withMessage("es_principal debe ser booleano"),
  body("contacto.activo")
    .optional()
    .isBoolean()
    .withMessage("activo debe ser booleano"),
]

export const updateContactoHttpValidator: ValidationChain[] = [
  body("contacto")
    .isObject()
    .withMessage("El objeto contacto es requerido"),
  body("contacto.tipo_contacto")
    .optional()
    .isIn(["telefono", "celular", "email", "direccion", "otro"])
    .withMessage("Tipo de contacto inválido"),
  body("contacto.valor")
    .optional()
    .isString()
    .withMessage("El valor del contacto debe ser texto")
    .isLength({ max: 255 })
    .withMessage("El valor del contacto no puede exceder 255 caracteres"),
  body("contacto.es_principal")
    .optional()
    .isBoolean()
    .withMessage("es_principal debe ser booleano"),
  body("contacto.activo")
    .optional()
    .isBoolean()
    .withMessage("activo debe ser booleano"),
]

export const bulkCreateContactoHttpValidator: ValidationChain[] = [
  body("contactos")
    .isArray({ min: 1 })
    .withMessage("Se requiere un array de contactos con al menos un elemento"),
  body("contactos.*.persona_id")
    .isInt({ min: 1 })
    .withMessage("Cada contacto debe tener un persona_id válido"),
  body("contactos.*.tipo_contacto")
    .isIn(["telefono", "celular", "email", "direccion", "otro"])
    .withMessage("Tipo de contacto inválido en array"),
  body("contactos.*.valor")
    .isString()
    .notEmpty()
    .withMessage("Cada contacto debe tener un valor")
    .isLength({ max: 255 })
    .withMessage("El valor no puede exceder 255 caracteres"),
]

export const contactoIdValidator: ValidationChain[] = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
]

export const personaIdValidator: ValidationChain[] = [
  param("personaId").isInt({ min: 1 }).withMessage("ID de persona inválido"),
]

export const searchContactoValidator: ValidationChain[] = [
  query("tipo")
    .optional()
    .isIn(["telefono", "celular", "email", "direccion", "otro"])
    .withMessage("Tipo de contacto inválido"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Página debe ser un número positivo"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Límite debe estar entre 1 y 100"),
]

// Legacy exports
export const createContactoValidator = createContactoHttpValidator
export const updateContactoValidator = updateContactoHttpValidator
export const bulkCreateContactoValidator = bulkCreateContactoHttpValidator
