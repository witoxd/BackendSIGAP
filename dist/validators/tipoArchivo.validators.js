"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTipoArchivoValidator = exports.createTipoArchivoValidator = exports.checkExtensionValidator = exports.tipoArchivoNombreValidator = exports.tipoArchivoRolValidator = exports.tipoArchivoIdValidator = exports.updateTipoArchivoHttpValidator = exports.createTipoArchivoHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators para TipoArchivo
exports.createTipoArchivoHttpValidator = [
    (0, express_validator_1.body)("tipo_archivo")
        .isObject()
        .withMessage("El objeto tipo_archivo es requerido"),
    (0, express_validator_1.body)("tipo_archivo.nombre")
        .isString()
        .withMessage("El nombre debe ser texto")
        .notEmpty()
        .withMessage("El nombre es requerido")
        .isLength({ max: 100 })
        .withMessage("El nombre debe tener máximo 100 caracteres"),
    (0, express_validator_1.body)("tipo_archivo.descripcion")
        .optional()
        .isString()
        .withMessage("La descripción debe ser texto"),
    (0, express_validator_1.body)("tipo_archivo.extensiones_permitidas")
        .optional()
        .isArray()
        .withMessage("extensiones_permitidas debe ser un array"),
    (0, express_validator_1.body)("tipo_archivo.extensiones_permitidas.*")
        .optional()
        .isString()
        .withMessage("Cada extensión debe ser texto")
        .matches(/^\.[a-z0-9]+$/i)
        .withMessage("Formato de extensión inválido (debe ser .ext)"),
    (0, express_validator_1.body)("tipo_archivo.activo")
        .optional()
        .isBoolean()
        .withMessage("activo debe ser booleano"),
];
exports.updateTipoArchivoHttpValidator = [
    (0, express_validator_1.body)("tipo_archivo")
        .isObject()
        .withMessage("El objeto tipo_archivo es requerido"),
    (0, express_validator_1.body)("tipo_archivo.nombre")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .isLength({ max: 100 })
        .withMessage("El nombre debe tener máximo 100 caracteres"),
    (0, express_validator_1.body)("tipo_archivo.descripcion")
        .optional()
        .isString()
        .withMessage("La descripción debe ser texto"),
    (0, express_validator_1.body)("tipo_archivo.extensiones_permitidas")
        .optional()
        .isArray()
        .withMessage("extensiones_permitidas debe ser un array"),
    (0, express_validator_1.body)("tipo_archivo.extensiones_permitidas.*")
        .optional()
        .isString()
        .withMessage("Cada extensión debe ser texto")
        .matches(/^\.[a-z0-9]+$/i)
        .withMessage("Formato de extensión inválido (debe ser .ext)"),
    (0, express_validator_1.body)("tipo_archivo.activo")
        .optional()
        .isBoolean()
        .withMessage("activo debe ser booleano"),
];
exports.tipoArchivoIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID inválido"),
];
exports.tipoArchivoRolValidator = [
    (0, express_validator_1.param)("rol")
        .isString()
        .notEmpty()
        .withMessage("El rol es requerido")
        .isIn(["estudiante", "acudiente", "profesor", "administrativo", "matricula", null])
        .withMessage("Rol inválido"),
];
exports.tipoArchivoNombreValidator = [
    (0, express_validator_1.param)("nombre")
        .isString()
        .notEmpty()
        .withMessage("Nombre es requerido"),
];
exports.checkExtensionValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID inválido"),
    (0, express_validator_1.query)("extension")
        .isString()
        .notEmpty()
        .withMessage("La extensión es requerida")
        .matches(/^\.[a-z0-9]+$/i)
        .withMessage("Formato de extensión inválido (debe ser .ext)"),
];
// Legacy exports
exports.createTipoArchivoValidator = exports.createTipoArchivoHttpValidator;
exports.updateTipoArchivoValidator = exports.updateTipoArchivoHttpValidator;
//# sourceMappingURL=tipoArchivo.validators.js.map