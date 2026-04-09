"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matriculaIdParamValidator = exports.desasociarArchivoHttpValidator = exports.asociarArchivosBulkHttpValidator = exports.asociarArchivoHttpValidator = exports.periodoMatriculaIdValidator = exports.updatePeriodoMatriculaHttpValidator = exports.createPeriodoMatriculaHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// =============================================================================
// PERIODO MATRICULA
// =============================================================================
exports.createPeriodoMatriculaHttpValidator = [
    (0, express_validator_1.body)("periodo")
        .isObject()
        .withMessage("El objeto periodo es requerido"),
    (0, express_validator_1.body)("periodo.anio")
        .isInt({ min: 2000, max: 2100 })
        .withMessage("El año debe ser un valor válido entre 2000 y 2100"),
    (0, express_validator_1.body)("periodo.fecha_inicio")
        .isISO8601()
        .withMessage("fecha_inicio debe ser una fecha válida (YYYY-MM-DD)"),
    (0, express_validator_1.body)("periodo.fecha_fin")
        .isISO8601()
        .withMessage("fecha_fin debe ser una fecha válida (YYYY-MM-DD)"),
    (0, express_validator_1.body)("periodo.descripcion")
        .optional()
        .isString()
        .withMessage("La descripción debe ser texto")
        .isLength({ max: 200 })
        .withMessage("La descripción no puede exceder 200 caracteres"),
];
exports.updatePeriodoMatriculaHttpValidator = [
    (0, express_validator_1.body)("periodo")
        .isObject()
        .withMessage("El objeto periodo es requerido"),
    (0, express_validator_1.body)("periodo.anio")
        .optional()
        .isInt({ min: 2000, max: 2100 })
        .withMessage("El año debe ser un valor válido entre 2000 y 2100"),
    (0, express_validator_1.body)("periodo.fecha_inicio")
        .optional()
        .isISO8601()
        .withMessage("fecha_inicio debe ser una fecha válida (YYYY-MM-DD)"),
    (0, express_validator_1.body)("periodo.fecha_fin")
        .optional()
        .isISO8601()
        .withMessage("fecha_fin debe ser una fecha válida (YYYY-MM-DD)"),
    (0, express_validator_1.body)("periodo.descripcion")
        .optional()
        .isString()
        .withMessage("La descripción debe ser texto")
        .isLength({ max: 200 })
        .withMessage("La descripción no puede exceder 200 caracteres"),
];
exports.periodoMatriculaIdValidator = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("ID de período inválido"),
];
// =============================================================================
// MATRICULA ARCHIVO
// =============================================================================
exports.asociarArchivoHttpValidator = [
    (0, express_validator_1.param)("matriculaId")
        .isInt({ min: 1 })
        .withMessage("ID de matrícula inválido"),
    (0, express_validator_1.body)("archivo_id")
        .isInt({ min: 1 })
        .withMessage("archivo_id debe ser un número entero positivo"),
];
exports.asociarArchivosBulkHttpValidator = [
    (0, express_validator_1.param)("matriculaId")
        .isInt({ min: 1 })
        .withMessage("ID de matrícula inválido"),
    (0, express_validator_1.body)("archivo_ids")
        .isArray({ min: 1 })
        .withMessage("archivo_ids debe ser un array con al menos un elemento"),
    (0, express_validator_1.body)("archivo_ids.*")
        .isInt({ min: 1 })
        .withMessage("Cada archivo_id debe ser un número entero positivo"),
];
exports.desasociarArchivoHttpValidator = [
    (0, express_validator_1.param)("matriculaId")
        .isInt({ min: 1 })
        .withMessage("ID de matrícula inválido"),
    (0, express_validator_1.param)("archivoId")
        .isInt({ min: 1 })
        .withMessage("ID de archivo inválido"),
];
exports.matriculaIdParamValidator = [
    (0, express_validator_1.param)("matriculaId")
        .isInt({ min: 1 })
        .withMessage("ID de matrícula inválido"),
];
//# sourceMappingURL=periodoMatricula.validators.js.map