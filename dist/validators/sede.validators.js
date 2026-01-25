"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSedeValidator = exports.sedeIdValidator = exports.updateSedeValidator = exports.createSedeValidator = exports.updateSedeHttpValidator = exports.createSedeHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createSedeHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .isString()
        .withMessage("El nombre debe ser texto")
        .notEmpty()
        .withMessage("El nombre es requerido")
        .isLength({ max: 100 })
        .withMessage("El nombre debe tener maximo 100 caracteres"),
    (0, express_validator_1.body)("direccion")
        .optional()
        .isString()
        .withMessage("La direccion debe ser texto")
        .isLength({ max: 100 })
        .withMessage("La direccion debe tener maximo 100 caracteres"),
];
exports.updateSedeHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .isLength({ max: 100 })
        .withMessage("El nombre debe tener maximo 100 caracteres"),
    (0, express_validator_1.body)("direccion")
        .optional()
        .isString()
        .withMessage("La direccion debe ser texto")
        .isLength({ max: 100 })
        .withMessage("La direccion debe tener maximo 100 caracteres"),
];
// Legacy exports for backward compatibility
exports.createSedeValidator = exports.createSedeHttpValidator;
exports.updateSedeValidator = exports.updateSedeHttpValidator;
exports.sedeIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido")
];
exports.searchSedeValidator = [
    (0, express_validator_1.query)("nombre").optional().isLength({ min: 1, max: 100 }).withMessage("Nombre invalido"),
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("Pagina debe ser un numero positivo"),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limite debe estar entre 1 y 100"),
];
//# sourceMappingURL=sede.validators.js.map