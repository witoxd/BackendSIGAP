"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMatriculaValidator = exports.createMatriculaValidator = exports.updateMatriculaHttpValidator = exports.createMatriculaHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createMatriculaHttpValidator = [
    (0, express_validator_1.body)("estudiante_id")
        .isInt({ min: 1 })
        .withMessage("El ID de estudiante es requerido y debe ser un numero valido"),
    (0, express_validator_1.body)("profesor_id")
        .isInt({ min: 1 })
        .withMessage("El ID de profesor es requerido y debe ser un numero valido"),
    (0, express_validator_1.body)("curso_id")
        .isInt({ min: 1 })
        .withMessage("El ID de curso es requerido y debe ser un numero valido"),
    (0, express_validator_1.body)("fecha_matricula")
        .optional()
        .isISO8601()
        .withMessage("La fecha de matricula debe ser una fecha valida"),
    (0, express_validator_1.body)("estado")
        .optional()
        .isIn(["activa", "finalizada", "retirada"])
        .withMessage("El estado debe ser activa, finalizada o retirada"),
];
exports.updateMatriculaHttpValidator = [
    (0, express_validator_1.body)("estudiante_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de estudiante debe ser un numero valido"),
    (0, express_validator_1.body)("profesor_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de profesor debe ser un numero valido"),
    (0, express_validator_1.body)("curso_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de curso debe ser un numero valido"),
    (0, express_validator_1.body)("fecha_matricula")
        .optional()
        .isISO8601()
        .withMessage("La fecha de matricula debe ser una fecha valida"),
    (0, express_validator_1.body)("estado")
        .optional()
        .isIn(["activa", "finalizada", "retirada"])
        .withMessage("El estado debe ser activa, finalizada o retirada"),
];
// Legacy exports for backward compatibility
exports.createMatriculaValidator = exports.createMatriculaHttpValidator;
exports.updateMatriculaValidator = exports.updateMatriculaHttpValidator;
//# sourceMappingURL=matricula.validators.js.map