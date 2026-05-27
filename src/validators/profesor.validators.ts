import { body, type ValidationChain } from "express-validator"

// ── Campos laborales del profesor ─────────────────────────────────────────────

const profesorFieldsCreate: ValidationChain[] = [
  body("profesor").isObject().withMessage("El objeto profesor es requerido"),

  body("profesor.decreto_id")
    .isInt({ min: 1 }).withMessage("El decreto es requerido"),

  body("profesor.grado_escalafon_id")
    .isInt({ min: 1 }).withMessage("El grado de escalafón es requerido"),

  body("profesor.area").isString().notEmpty().withMessage("El área es requerida"),
  body("profesor.sede").isString().notEmpty().withMessage("La sede es requerida"),
  body("profesor.tipo_contrato").isString().notEmpty().withMessage("El tipo de contrato es requerido"),

  body("profesor.fecha_contratacion")
    .optional().isISO8601().withMessage("La fecha de contratación debe ser una fecha válida"),
  body("profesor.fecha_nombramiento")
    .isISO8601().withMessage("La fecha de nombramiento debe ser una fecha válida"),
  body("profesor.numero_resolucion")
    .isString().notEmpty().withMessage("El número de resolución es requerido"),

  body("profesor.jornada_id")
    .isInt({ min: 1 }).withMessage("La jornada es requerida"),

  body("profesor.estado")
    .optional()
    .isIn(["activo", "inactivo"]).withMessage("El estado debe ser activo o inactivo"),

  body("profesor.titulo").optional().isString(),
  body("profesor.posgrado").optional().isString(),
  body("profesor.perfil_profesional").optional().isString(),
]

const profesorFieldsUpdate: ValidationChain[] = [
  body("profesor").optional().isObject(),

  body("profesor.decreto_id").optional().isInt({ min: 1 }).withMessage("El decreto debe ser un ID válido"),

  body("profesor.grado_escalafon_id").optional().isInt({ min: 1 }).withMessage("El grado de escalafón debe ser un ID válido"),

  body("profesor.area").optional().isString().notEmpty(),
  body("profesor.sede").optional().isString().notEmpty(),
  body("profesor.tipo_contrato").optional().isString().notEmpty(),
  body("profesor.fecha_contratacion").optional().isISO8601(),
  body("profesor.fecha_nombramiento").optional().isISO8601(),
  body("profesor.numero_resolucion").optional().isString().notEmpty(),
  body("profesor.jornada_id").optional().isInt({ min: 1 }),
  body("profesor.estado").optional().isIn(["activo", "inactivo"]),
  body("profesor.titulo").optional().isString(),
  body("profesor.posgrado").optional().isString(),
  body("profesor.perfil_profesional").optional().isString(),
]

// ── Persona ───────────────────────────────────────────────────────────────────

const personaFieldsCreate: ValidationChain[] = [
  body("persona").isObject().withMessage("El objeto persona es requerido"),
  body("persona.nombres").isString().notEmpty().withMessage("Los nombres son requeridos"),
  body("persona.apellido_paterno").optional().isString(),
  body("persona.apellido_materno").optional().isString(),
  body("persona.tipo_documento_id").isInt({ min: 1 }).withMessage("El tipo de documento es requerido"),
  body("persona.numero_documento").isString().notEmpty().withMessage("El número de documento es requerido"),
  body("persona.fecha_nacimiento").isISO8601().withMessage("La fecha de nacimiento es requerida"),
  body("persona.genero").isIn(["Masculino", "Femenino", "Otro"]).withMessage("Género inválido"),
]

const personaFieldsUpdate: ValidationChain[] = [
  body("persona").optional().isObject(),
  body("persona.nombres").optional().isString().notEmpty(),
  body("persona.apellido_paterno").optional().isString(),
  body("persona.apellido_materno").optional().isString(),
  body("persona.numero_documento").optional().isString().notEmpty(),
]

// ── Contactos ─────────────────────────────────────────────────────────────────

const contactosCreate: ValidationChain[] = [
  body("contactos")
    .isArray({ min: 1 }).withMessage("Se requiere al menos un contacto"),
  body("contactos.*.tipo_contacto")
    .isIn(["telefono", "celular", "email", "direccion", "otro"])
    .withMessage("Tipo de contacto inválido"),
  body("contactos.*.valor")
    .isString().notEmpty().withMessage("El valor del contacto es requerido"),
  body("contactos.*.es_principal")
    .isBoolean().withMessage("es_principal debe ser booleano"),
]

// ── Contacto de emergencia ────────────────────────────────────────────────────

const contactoEmergenciaCreate: ValidationChain[] = [
  body("contacto_emergencia")
    .isObject().withMessage("El contacto de emergencia es requerido"),
  body("contacto_emergencia.nombre")
    .isString().notEmpty().withMessage("El nombre del contacto de emergencia es requerido"),
  body("contacto_emergencia.parentesco")
    .isString().notEmpty().withMessage("El parentesco es requerido"),
  body("contacto_emergencia.telefono")
    .isString().notEmpty().withMessage("El teléfono del contacto de emergencia es requerido"),
  body("contacto_emergencia.celular").optional().isString(),
]

// ── Exports ───────────────────────────────────────────────────────────────────

export const createProfesorHttpValidator: ValidationChain[] = [
  ...personaFieldsCreate,
  ...profesorFieldsCreate,
  ...contactosCreate,
  ...contactoEmergenciaCreate,
]

export const updateProfesorHttpValidator: ValidationChain[] = [
  ...personaFieldsUpdate,
  ...profesorFieldsUpdate,
]

// Legacy
export const createProfesorValidator = createProfesorHttpValidator
export const updateProfesorValidator  = updateProfesorHttpValidator
