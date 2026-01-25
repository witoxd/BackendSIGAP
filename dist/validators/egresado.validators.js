"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchEgresadoValidator = exports.egresadoIdValidator = exports.updateEgresadoValidator = exports.createEgresadoValidator = exports.updateEgresadoHttpValidator = exports.createEgresadoHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createEgresadoHttpValidator = [
    (0, express_validator_1.body)("egresado.estudiante_id")
        .isInt({ min: 1 })
        .withMessage("El ID de estudiante es requerido y debe ser un numero valido"),
    (0, express_validator_1.body)("egresado.fecha_grado")
        .optional()
        .isISO8601()
        .withMessage("La fecha de grado debe ser una fecha valida"),
];
exports.updateEgresadoHttpValidator = [
    (0, express_validator_1.body)("egresado.estudiante_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de estudiante debe ser un numero valido"),
    (0, express_validator_1.body)("egresado.fecha_grado")
        .optional()
        .isISO8601()
        .withMessage("La fecha de grado debe ser una fecha valida"),
];
// Legacy exports for backward compatibility
exports.createEgresadoValidator = exports.createEgresadoHttpValidator;
exports.updateEgresadoValidator = exports.updateEgresadoHttpValidator;
exports.egresadoIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido")
];
exports.searchEgresadoValidator = [
    (0, express_validator_1.query)("year").optional().isInt({ min: 1900, max: 2100 }).withMessage("Ano invalido"),
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("Pagina debe ser un numero positivo"),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limite debe estar entre 1 y 100"),
];
//# sourceMappingURL=egresado.validators.js.map