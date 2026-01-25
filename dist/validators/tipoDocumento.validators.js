"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipoDocumentoIdValidator = exports.updateTipoDocumentoValidator = exports.createTipoDocumentoValidator = exports.updateTipoDocumentoHttpValidator = exports.createTipoDocumentoHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createTipoDocumentoHttpValidator = [
    (0, express_validator_1.body)("tipo_documento")
        .isString()
        .withMessage("El tipo de documento debe ser texto")
        .notEmpty()
        .withMessage("El tipo de documento es requerido")
        .isLength({ max: 50 })
        .withMessage("El tipo de documento debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("nombre_documento")
        .isString()
        .withMessage("El nombre del documento debe ser texto")
        .notEmpty()
        .withMessage("El nombre del documento es requerido")
        .isLength({ max: 50 })
        .withMessage("El nombre del documento debe tener maximo 50 caracteres"),
];
exports.updateTipoDocumentoHttpValidator = [
    (0, express_validator_1.body)("tipo_documento")
        .optional()
        .isString()
        .withMessage("El tipo de documento debe ser texto")
        .isLength({ max: 50 })
        .withMessage("El tipo de documento debe tener maximo 50 caracteres"),
    (0, express_validator_1.body)("nombre_documento")
        .optional()
        .isString()
        .withMessage("El nombre del documento debe ser texto")
        .isLength({ max: 50 })
        .withMessage("El nombre del documento debe tener maximo 50 caracteres"),
];
// Legacy exports for backward compatibility
exports.createTipoDocumentoValidator = exports.createTipoDocumentoHttpValidator;
exports.updateTipoDocumentoValidator = exports.updateTipoDocumentoHttpValidator;
exports.tipoDocumentoIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido")
];
//# sourceMappingURL=tipoDocumento.validators.js.map