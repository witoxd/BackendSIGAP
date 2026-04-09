"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertExpedienteHttpValidator = exports.upsertViviendaHttpValidator = exports.replaceColegiosHttpValidator = exports.updateColegioHttpValidator = exports.createColegioHttpValidator = exports.upsertFichaHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// =============================================================================
// FICHA ESTUDIANTE
// =============================================================================
exports.upsertFichaHttpValidator = [
    (0, express_validator_1.body)("ficha")
        .isObject()
        .withMessage("El objeto ficha es requerido"),
    // Contexto familiar
    (0, express_validator_1.body)("ficha.numero_hermanos")
        .optional()
        .isInt({ min: 0 })
        .withMessage("numero_hermanos debe ser un número entero positivo"),
    (0, express_validator_1.body)("ficha.posicion_hermanos")
        .optional()
        .isInt({ min: 1 })
        .withMessage("posicion_hermanos debe ser un número positivo"),
    (0, express_validator_1.body)("ficha.nombre_hermano_mayor")
        .optional()
        .isString()
        .isLength({ max: 150 })
        .withMessage("nombre_hermano_mayor debe tener máximo 150 caracteres"),
    (0, express_validator_1.body)("ficha.parientes_hogar")
        .optional()
        .isString()
        .withMessage("parientes_hogar debe ser texto"),
    (0, express_validator_1.body)("ficha.total_parientes")
        .optional()
        .isInt({ min: 0 })
        .withMessage("total_parientes debe ser un número positivo"),
    // Contexto escolar
    (0, express_validator_1.body)("ficha.motivo_traslado")
        .optional()
        .isString()
        .isLength({ max: 300 })
        .withMessage("motivo_traslado debe tener máximo 300 caracteres"),
    (0, express_validator_1.body)("ficha.limitaciones_fisicas")
        .optional()
        .isString()
        .withMessage("limitaciones_fisicas debe ser texto"),
    (0, express_validator_1.body)("ficha.talentos_especiales")
        .optional()
        .isString()
        .withMessage("talentos_especiales debe ser texto"),
    (0, express_validator_1.body)("ficha.otras_actividades")
        .optional()
        .isString()
        .withMessage("otras_actividades debe ser texto"),
    // Datos médicos
    (0, express_validator_1.body)("ficha.eps_ars")
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage("eps_ars debe tener máximo 100 caracteres"),
    (0, express_validator_1.body)("ficha.alergia")
        .optional()
        .isString()
        .withMessage("alergia debe ser texto"),
    (0, express_validator_1.body)("ficha.centro_atencion_medica")
        .optional()
        .isString()
        .isLength({ max: 150 })
        .withMessage("centro_atencion_medica debe tener máximo 150 caracteres"),
    // Transporte
    (0, express_validator_1.body)("ficha.medio_transporte")
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage("medio_transporte debe tener máximo 100 caracteres"),
    (0, express_validator_1.body)("ficha.transporte_propio")
        .optional()
        .isBoolean()
        .withMessage("transporte_propio debe ser verdadero o falso"),
    // Observaciones
    (0, express_validator_1.body)("ficha.observaciones")
        .optional()
        .isString()
        .withMessage("observaciones debe ser texto"),
];
// =============================================================================
// COLEGIO ANTERIOR — crear uno
// =============================================================================
exports.createColegioHttpValidator = [
    (0, express_validator_1.body)("colegio")
        .isObject()
        .withMessage("El objeto colegio es requerido"),
    (0, express_validator_1.body)("colegio.nombre_colegio")
        .isString()
        .notEmpty()
        .withMessage("nombre_colegio es requerido")
        .isLength({ max: 200 })
        .withMessage("nombre_colegio debe tener máximo 200 caracteres"),
    (0, express_validator_1.body)("colegio.ciudad")
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage("ciudad debe tener máximo 100 caracteres"),
    (0, express_validator_1.body)("colegio.grado_cursado")
        .optional()
        .isString()
        .isLength({ max: 50 })
        .withMessage("grado_cursado debe tener máximo 50 caracteres"),
    (0, express_validator_1.body)("colegio.anio")
        .optional()
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage("anio debe ser un año válido"),
];
// =============================================================================
// COLEGIO ANTERIOR — actualizar uno
// =============================================================================
exports.updateColegioHttpValidator = [
    (0, express_validator_1.param)("colegioId")
        .isInt({ min: 1 })
        .withMessage("colegioId debe ser un número entero positivo"),
    (0, express_validator_1.body)("colegio")
        .isObject()
        .withMessage("El objeto colegio es requerido"),
    (0, express_validator_1.body)("colegio.nombre_colegio")
        .optional()
        .isString()
        .isLength({ max: 200 })
        .withMessage("nombre_colegio debe tener máximo 200 caracteres"),
    (0, express_validator_1.body)("colegio.ciudad")
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage("ciudad debe tener máximo 100 caracteres"),
    (0, express_validator_1.body)("colegio.grado_cursado")
        .optional()
        .isString()
        .isLength({ max: 50 })
        .withMessage("grado_cursado debe tener máximo 50 caracteres"),
    (0, express_validator_1.body)("colegio.anio")
        .optional()
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage("anio debe ser un año válido"),
    (0, express_validator_1.body)("colegio.orden")
        .optional()
        .isInt({ min: 1 })
        .withMessage("orden debe ser un número positivo"),
];
// =============================================================================
// COLEGIO ANTERIOR — replaceAll (lista completa)
// =============================================================================
exports.replaceColegiosHttpValidator = [
    (0, express_validator_1.body)("colegios")
        .isArray()
        .withMessage("colegios debe ser un array"),
    (0, express_validator_1.body)("colegios.*.nombre_colegio")
        .isString()
        .notEmpty()
        .withMessage("Cada colegio debe tener nombre_colegio"),
    (0, express_validator_1.body)("colegios.*.ciudad")
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage("ciudad debe tener máximo 100 caracteres"),
    (0, express_validator_1.body)("colegios.*.grado_cursado")
        .optional()
        .isString()
        .isLength({ max: 50 })
        .withMessage("grado_cursado debe tener máximo 50 caracteres"),
    (0, express_validator_1.body)("colegios.*.anio")
        .optional()
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage("anio debe ser un año válido"),
];
// =============================================================================
// VIVIENDA ESTUDIANTE
// =============================================================================
exports.upsertViviendaHttpValidator = [
    (0, express_validator_1.body)("vivienda")
        .isObject()
        .withMessage("El objeto vivienda es requerido"),
    (0, express_validator_1.body)("vivienda.tipo_paredes")
        .optional()
        .isString()
        .isLength({ max: 80 })
        .withMessage("tipo_paredes debe tener máximo 80 caracteres"),
    (0, express_validator_1.body)("vivienda.tipo_techo")
        .optional()
        .isString()
        .isLength({ max: 80 })
        .withMessage("tipo_techo debe tener máximo 80 caracteres"),
    (0, express_validator_1.body)("vivienda.tipo_pisos")
        .optional()
        .isString()
        .isLength({ max: 80 })
        .withMessage("tipo_pisos debe tener máximo 80 caracteres"),
    (0, express_validator_1.body)("vivienda.num_banos")
        .optional()
        .isInt({ min: 0 })
        .withMessage("num_banos debe ser un número positivo"),
    (0, express_validator_1.body)("vivienda.num_cuartos")
        .optional()
        .isInt({ min: 0 })
        .withMessage("num_cuartos debe ser un número positivo"),
];
// =============================================================================
// EXPEDIENTE COMPLETO — upsert de las 3 secciones a la vez
// Al menos una sección debe venir en el body
// =============================================================================
exports.upsertExpedienteHttpValidator = [
    (0, express_validator_1.body)()
        .custom((body) => {
        if (!body.ficha && !body.colegios && !body.vivienda) {
            throw new Error("Debe enviar al menos una sección: ficha, colegios o vivienda");
        }
        return true;
    }),
    (0, express_validator_1.body)("ficha")
        .optional()
        .isObject()
        .withMessage("ficha debe ser un objeto"),
    (0, express_validator_1.body)("colegios")
        .optional()
        .isArray()
        .withMessage("colegios debe ser un array"),
    (0, express_validator_1.body)("vivienda")
        .optional()
        .isObject()
        .withMessage("vivienda debe ser un objeto"),
];
//# sourceMappingURL=fichaEstudiante.validators.js.map