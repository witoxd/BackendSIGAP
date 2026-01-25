"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permisoIdValidator = exports.assignPermisoValidator = exports.updatePermisoValidator = exports.createPermisoValidator = exports.updatePermisoHttpValidator = exports.createPermisoHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createPermisoHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .isString()
        .withMessage("El nombre debe ser texto")
        .notEmpty()
        .withMessage("El nombre es requerido")
        .isLength({ max: 50 })
        .withMessage("El nombre debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("descripcion")
        .optional()
        .isString()
        .withMessage("La descripcion debe ser texto"),
    (0, express_validator_1.body)("recurso")
        .isString()
        .withMessage("El recurso debe ser texto")
        .notEmpty()
        .withMessage("El recurso es requerido"),
    (0, express_validator_1.body)("accion")
        .isString()
        .withMessage("La accion debe ser texto")
        .notEmpty()
        .withMessage("La accion es requerida"),
];
exports.updatePermisoHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .isLength({ max: 50 })
        .withMessage("El nombre debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("descripcion")
        .optional()
        .isString()
        .withMessage("La descripcion debe ser texto"),
    (0, express_validator_1.body)("recurso")
        .optional()
        .isString()
        .withMessage("El recurso debe ser texto"),
    (0, express_validator_1.body)("accion")
        .optional()
        .isString()
        .withMessage("La accion debe ser texto"),
];
// Legacy exports for backward compatibility
exports.createPermisoValidator = exports.createPermisoHttpValidator;
exports.updatePermisoValidator = exports.updatePermisoHttpValidator;
exports.assignPermisoValidator = [
    (0, express_validator_1.body)("role_id").isInt({ min: 1 }).withMessage("role_id debe ser un numero positivo"),
    (0, express_validator_1.body)("permiso_id").isInt({ min: 1 }).withMessage("permiso_id debe ser un numero positivo"),
];
exports.permisoIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido")
];
//# sourceMappingURL=permiso.validators.js.map