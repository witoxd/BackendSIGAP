"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCursoValidator = exports.createCursoValidator = exports.updateCursoHttpValidator = exports.createCursoHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createCursoHttpValidator = [
    (0, express_validator_1.body)("curso.nombre")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .isLength({ max: 100 })
        .withMessage("El nombre debe tener maximo 100 caracteres"),
    (0, express_validator_1.body)("curso.grado")
        .isString()
        .withMessage("El grado debe ser texto")
        .notEmpty()
        .withMessage("El grado es requerido")
        .isLength({ max: 20 })
        .withMessage("El grado debe tener maximo 20 caracteres"),
];
exports.updateCursoHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .isLength({ max: 100 })
        .withMessage("El nombre debe tener maximo 100 caracteres"),
    (0, express_validator_1.body)("grado")
        .optional()
        .isString()
        .withMessage("El grado debe ser texto")
        .isLength({ max: 20 })
        .withMessage("El grado debe tener maximo 20 caracteres"),
];
// Legacy exports for backward compatibility
exports.createCursoValidator = exports.createCursoHttpValidator;
exports.updateCursoValidator = exports.updateCursoHttpValidator;
//# sourceMappingURL=curso.validators.js.map