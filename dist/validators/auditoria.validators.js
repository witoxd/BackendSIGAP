"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAuditoriaValidator = exports.auditoriaIdValidator = exports.updateAuditoriaValidator = exports.createAuditoriaValidator = exports.updateAuditoriaHttpValidator = exports.createAuditoriaHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
// Auditoria is typically read-only, but validators included for completeness
exports.createAuditoriaHttpValidator = [
    (0, express_validator_1.body)("tabla_nombre")
        .isString()
        .withMessage("El nombre de tabla debe ser texto")
        .notEmpty()
        .withMessage("El nombre de tabla es requerido")
        .isLength({ max: 50 })
        .withMessage("El nombre de tabla debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("accion")
        .isString()
        .withMessage("La accion debe ser texto")
        .notEmpty()
        .withMessage("La accion es requerida")
        .isLength({ max: 50 })
        .withMessage("La accion debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("usuario_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de usuario debe ser un numero valido"),
    (0, express_validator_1.body)("fecha")
        .optional()
        .isISO8601()
        .withMessage("La fecha debe ser una fecha valida"),
    (0, express_validator_1.body)("detalle")
        .optional()
        .isObject()
        .withMessage("El detalle debe ser un objeto"),
];
exports.updateAuditoriaHttpValidator = [
    (0, express_validator_1.body)("tabla_nombre")
        .optional()
        .isString()
        .withMessage("El nombre de tabla debe ser texto")
        .isLength({ max: 50 })
        .withMessage("El nombre de tabla debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("accion")
        .optional()
        .isString()
        .withMessage("La accion debe ser texto")
        .isLength({ max: 50 })
        .withMessage("La accion debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("usuario_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de usuario debe ser un numero valido"),
    (0, express_validator_1.body)("fecha")
        .optional()
        .isISO8601()
        .withMessage("La fecha debe ser una fecha valida"),
    (0, express_validator_1.body)("detalle")
        .optional()
        .isObject()
        .withMessage("El detalle debe ser un objeto"),
];
// Legacy exports for backward compatibility
exports.createAuditoriaValidator = exports.createAuditoriaHttpValidator;
exports.updateAuditoriaValidator = exports.updateAuditoriaHttpValidator;
exports.auditoriaIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido")
];
exports.searchAuditoriaValidator = [
    (0, express_validator_1.query)("usuario_id").optional().isInt({ min: 1 }).withMessage("usuario_id debe ser un numero positivo"),
    (0, express_validator_1.query)("accion").optional().isIn(["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"]).withMessage("Accion invalida"),
    (0, express_validator_1.query)("tabla").optional().isLength({ min: 1, max: 100 }).withMessage("Tabla invalida"),
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("Pagina debe ser un numero positivo"),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limite debe estar entre 1 y 100"),
];
//# sourceMappingURL=auditoria.validators.js.map