import { body, param, type ValidationChain } from "express-validator"

// =============================================================================
// FICHA ESTUDIANTE
// =============================================================================

export const upsertFichaHttpValidator: ValidationChain[] = [
  body("ficha")
    .isObject()
    .withMessage("El objeto ficha es requerido"),

  // Contexto familiar
  body("ficha.numero_hermanos")
    .optional()
    .isInt({ min: 0 })
    .withMessage("numero_hermanos debe ser un número entero positivo"),
  body("ficha.posicion_hermanos")
    .optional()
    .isInt({ min: 1 })
    .withMessage("posicion_hermanos debe ser un número positivo"),
  body("ficha.nombre_hermano_mayor")
    .optional()
    .isString()
    .isLength({ max: 150 })
    .withMessage("nombre_hermano_mayor debe tener máximo 150 caracteres"),
  body("ficha.parientes_hogar")
    .optional()
    .isString()
    .withMessage("parientes_hogar debe ser texto"),
  body("ficha.total_parientes")
    .optional()
    .isInt({ min: 0 })
    .withMessage("total_parientes debe ser un número positivo"),

  // Contexto escolar
  body("ficha.motivo_traslado")
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage("motivo_traslado debe tener máximo 300 caracteres"),
  body("ficha.limitaciones_fisicas")
    .optional()
    .isString()
    .withMessage("limitaciones_fisicas debe ser texto"),
  body("ficha.talentos_especiales")
    .optional()
    .isString()
    .withMessage("talentos_especiales debe ser texto"),
  body("ficha.otras_actividades")
    .optional()
    .isString()
    .withMessage("otras_actividades debe ser texto"),

  // Datos médicos
  body("ficha.eps_ars")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("eps_ars debe tener máximo 100 caracteres"),
  body("ficha.alergia")
    .optional()
    .isString()
    .withMessage("alergia debe ser texto"),
  body("ficha.centro_atencion_medica")
    .optional()
    .isString()
    .isLength({ max: 150 })
    .withMessage("centro_atencion_medica debe tener máximo 150 caracteres"),

  // Transporte
  body("ficha.medio_transporte")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("medio_transporte debe tener máximo 100 caracteres"),
  body("ficha.transporte_propio")
    .optional()
    .isBoolean()
    .withMessage("transporte_propio debe ser verdadero o falso"),

  // Observaciones
  body("ficha.observaciones")
    .optional()
    .isString()
    .withMessage("observaciones debe ser texto"),
]

// =============================================================================
// COLEGIO ANTERIOR — crear uno
// =============================================================================

export const createColegioHttpValidator: ValidationChain[] = [
  body("colegio")
    .isObject()
    .withMessage("El objeto colegio es requerido"),
  body("colegio.nombre_colegio")
    .isString()
    .notEmpty()
    .withMessage("nombre_colegio es requerido")
    .isLength({ max: 200 })
    .withMessage("nombre_colegio debe tener máximo 200 caracteres"),
  body("colegio.ciudad")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("ciudad debe tener máximo 100 caracteres"),
  body("colegio.grado_cursado")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("grado_cursado debe tener máximo 50 caracteres"),
  body("colegio.anio")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("anio debe ser un año válido"),
]

// =============================================================================
// COLEGIO ANTERIOR — actualizar uno
// =============================================================================

export const updateColegioHttpValidator: ValidationChain[] = [
  param("colegioId")
    .isInt({ min: 1 })
    .withMessage("colegioId debe ser un número entero positivo"),
  body("colegio")
    .isObject()
    .withMessage("El objeto colegio es requerido"),
  body("colegio.nombre_colegio")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("nombre_colegio debe tener máximo 200 caracteres"),
  body("colegio.ciudad")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("ciudad debe tener máximo 100 caracteres"),
  body("colegio.grado_cursado")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("grado_cursado debe tener máximo 50 caracteres"),
  body("colegio.anio")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("anio debe ser un año válido"),
  body("colegio.orden")
    .optional()
    .isInt({ min: 1 })
    .withMessage("orden debe ser un número positivo"),
]

// =============================================================================
// COLEGIO ANTERIOR — replaceAll (lista completa)
// =============================================================================

export const replaceColegiosHttpValidator: ValidationChain[] = [
  body("colegios")
    .isArray()
    .withMessage("colegios debe ser un array"),
  body("colegios.*.nombre_colegio")
    .isString()
    .notEmpty()
    .withMessage("Cada colegio debe tener nombre_colegio"),
  body("colegios.*.ciudad")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("ciudad debe tener máximo 100 caracteres"),
  body("colegios.*.grado_cursado")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("grado_cursado debe tener máximo 50 caracteres"),
  body("colegios.*.anio")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("anio debe ser un año válido"),
]

// =============================================================================
// VIVIENDA ESTUDIANTE
// =============================================================================

export const upsertViviendaHttpValidator: ValidationChain[] = [
  body("vivienda")
    .isObject()
    .withMessage("El objeto vivienda es requerido"),
  body("vivienda.tipo_paredes")
    .optional()
    .isString()
    .isLength({ max: 80 })
    .withMessage("tipo_paredes debe tener máximo 80 caracteres"),
  body("vivienda.tipo_techo")
    .optional()
    .isString()
    .isLength({ max: 80 })
    .withMessage("tipo_techo debe tener máximo 80 caracteres"),
  body("vivienda.tipo_pisos")
    .optional()
    .isString()
    .isLength({ max: 80 })
    .withMessage("tipo_pisos debe tener máximo 80 caracteres"),
  body("vivienda.num_banos")
    .optional()
    .isInt({ min: 0 })
    .withMessage("num_banos debe ser un número positivo"),
  body("vivienda.num_cuartos")
    .optional()
    .isInt({ min: 0 })
    .withMessage("num_cuartos debe ser un número positivo"),
]

// =============================================================================
// EXPEDIENTE COMPLETO — upsert de las 3 secciones a la vez
// Al menos una sección debe venir en el body
// =============================================================================

export const upsertExpedienteHttpValidator: ValidationChain[] = [
  body()
    .custom((body) => {
      if (!body.ficha && !body.colegios && !body.vivienda) {
        throw new Error("Debe enviar al menos una sección: ficha, colegios o vivienda")
      }
      return true
    }),
  body("ficha")
    .optional()
    .isObject()
    .withMessage("ficha debe ser un objeto"),
  body("colegios")
    .optional()
    .isArray()
    .withMessage("colegios debe ser un array"),
  body("vivienda")
    .optional()
    .isObject()
    .withMessage("vivienda debe ser un objeto"),
]
