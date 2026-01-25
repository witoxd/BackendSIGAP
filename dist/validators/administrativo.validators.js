"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdministrativoValidator = exports.createAdministrativoValidator = exports.updateAdministrativoHttpValidator = exports.createAdministrativoHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createAdministrativoHttpValidator = [
    (0, express_validator_1.body)("administrativo")
        .isObject()
        .withMessage("El objeto administrativo es requerido"),
    (0, express_validator_1.body)("administrativo.cargo")
        .isString()
        .withMessage("El cargo debe ser texto")
        .notEmpty()
        .withMessage("El cargo es requerido"),
    (0, express_validator_1.body)("administrativo.sede_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de sede debe ser un numero valido"),
    (0, express_validator_1.body)("administrativo.estado")
        .optional()
        .isBoolean()
        .withMessage("El estado debe ser booleano"),
    (0, express_validator_1.body)("administrativo.fecha_contratacion")
        .optional()
        .isISO8601()
        .withMessage("La fecha de contratacion debe ser una fecha valida"),
];
exports.updateAdministrativoHttpValidator = [
    (0, express_validator_1.body)("administrativo")
        .optional()
        .isObject()
        .withMessage("El objeto administrativo debe ser un objeto"),
    (0, express_validator_1.body)("administrativo.cargo")
        .optional()
        .isString()
        .withMessage("El cargo debe ser texto"),
    (0, express_validator_1.body)("administrativo.sede_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de sede debe ser un numero valido"),
    (0, express_validator_1.body)("administrativo.estado")
        .optional()
        .isBoolean()
        .withMessage("El estado debe ser booleano"),
    (0, express_validator_1.body)("administrativo.fecha_contratacion")
        .optional()
        .isISO8601()
        .withMessage("La fecha de contratacion debe ser una fecha valida"),
];
// Legacy exports for backward compatibility
exports.createAdministrativoValidator = exports.createAdministrativoHttpValidator;
exports.updateAdministrativoValidator = exports.updateAdministrativoHttpValidator;
//# sourceMappingURL=administrativo.validators.js.map