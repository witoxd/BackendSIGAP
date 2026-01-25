"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleValidator = exports.createRoleValidator = exports.updateRoleHttpValidator = exports.createRoleHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createRoleHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .isIn(["admin", "profesor", "estudiante", "administrativo"])
        .withMessage("El nombre debe ser admin, profesor, estudiante o administrativo"),
    (0, express_validator_1.body)("descripcion")
        .optional()
        .isString()
        .withMessage("La descripcion debe ser texto")
        .isLength({ max: 255 })
        .withMessage("La descripcion debe tener maximo 255 caracteres"),
];
exports.updateRoleHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .optional()
        .isIn(["admin", "profesor", "estudiante", "administrativo"])
        .withMessage("El nombre debe ser admin, profesor, estudiante o administrativo"),
    (0, express_validator_1.body)("descripcion")
        .optional()
        .isString()
        .withMessage("La descripcion debe ser texto")
        .isLength({ max: 255 })
        .withMessage("La descripcion debe tener maximo 255 caracteres"),
];
// Legacy exports for backward compatibility
exports.createRoleValidator = exports.createRoleHttpValidator;
exports.updateRoleValidator = exports.updateRoleHttpValidator;
//# sourceMappingURL=role.validators.js.map