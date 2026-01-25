"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jornadaIdValidator = exports.updateJornadaValidator = exports.createJornadaValidator = exports.updateJornadaHttpValidator = exports.createJornadaHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createJornadaHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .isString()
        .withMessage("El nombre debe ser texto")
        .notEmpty()
        .withMessage("El nombre es requerido")
        .isLength({ max: 50 })
        .withMessage("El nombre debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("hora_inicio")
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage("La hora de inicio debe tener formato HH:MM o HH:MM:SS"),
    (0, express_validator_1.body)("hora_fin")
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage("La hora de fin debe tener formato HH:MM o HH:MM:SS"),
];
exports.updateJornadaHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .isLength({ max: 50 })
        .withMessage("El nombre debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("hora_inicio")
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage("La hora de inicio debe tener formato HH:MM o HH:MM:SS"),
    (0, express_validator_1.body)("hora_fin")
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage("La hora de fin debe tener formato HH:MM o HH:MM:SS"),
];
// Legacy exports for backward compatibility
exports.createJornadaValidator = exports.createJornadaHttpValidator;
exports.updateJornadaValidator = exports.updateJornadaHttpValidator;
exports.jornadaIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido")
];
//# sourceMappingURL=jornada.validators.js.map