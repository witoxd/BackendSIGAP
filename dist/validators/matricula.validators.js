"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMatriculaValidator = exports.createMatriculaValidator = exports.updateMatriculaHttpValidator = exports.createMatriculaHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createMatriculaHttpValidator = [
    (0, express_validator_1.body)("matricula.estudiante_id")
        .isInt({ min: 1 })
        .withMessage("El ID de estudiante es requerido y debe ser un numero valido"),
    (0, express_validator_1.body)("matricula.profesor_id")
        .isInt({ min: 1 })
        .withMessage("El ID de profesor es requerido y debe ser un numero valido"),
    (0, express_validator_1.body)("matricula.curso_id")
        .isInt({ min: 1 })
        .withMessage("El ID de curso es requerido y debe ser un numero valido"),
    (0, express_validator_1.body)("matricula.fecha_matricula")
        .optional()
        .isISO8601()
        .withMessage("La fecha de matricula debe ser una fecha valida"),
    (0, express_validator_1.body)("matricula.estado")
        .optional()
        .isIn(["activa", "finalizada", "retirada"])
        .withMessage("El estado debe ser activa, finalizada o retirada"),
    (0, express_validator_1.body)("matricula.anio_egreso")
        .optional()
        .isInt({ min: 1900 })
        .withMessage("El año de egreso debe ser valido")
];
exports.updateMatriculaHttpValidator = [
    (0, express_validator_1.body)("matricula.estudiante_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de estudiante debe ser un numero valido"),
    (0, express_validator_1.body)("matricula.profesor_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de profesor debe ser un numero valido"),
    (0, express_validator_1.body)("matricula.curso_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de curso debe ser un numero valido"),
    (0, express_validator_1.body)("matricula.fecha_matricula")
        .optional()
        .isISO8601()
        .withMessage("La fecha de matricula debe ser una fecha valida"),
    (0, express_validator_1.body)("matricula.estado")
        .optional()
        .isIn(["activa", "finalizada", "retirada"])
        .withMessage("El estado debe ser activa, finalizada o retirada"),
    (0, express_validator_1.body)("matricula.anio_egreso")
        .optional()
        .isInt({ min: 19000 })
        .withMessage("El año de egreso debe ser valido")
];
// Legacy exports for backward compatibility
exports.createMatriculaValidator = exports.createMatriculaHttpValidator;
exports.updateMatriculaValidator = exports.updateMatriculaHttpValidator;
//# sourceMappingURL=matricula.validators.js.map