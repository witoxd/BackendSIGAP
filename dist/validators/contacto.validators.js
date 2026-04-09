"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateContactoValidator = exports.updateContactoValidator = exports.createContactoValidator = exports.searchContactoValidator = exports.personaIdValidator = exports.contactoIdValidator = exports.bulkCreateContactoHttpValidator = exports.updateContactoHttpValidator = exports.createContactoHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators para Contacto
exports.createContactoHttpValidator = [
    (0, express_validator_1.body)("contacto")
        .isObject()
        .withMessage("El objeto contacto es requerido"),
    (0, express_validator_1.body)("contacto.persona_id")
        .isInt({ min: 1 })
        .withMessage("El ID de persona es requerido y debe ser un número válido"),
    (0, express_validator_1.body)("contacto.tipo_contacto")
        .isIn(["telefono", "celular", "email", "direccion", "otro"])
        .withMessage("Tipo de contacto inválido. Valores permitidos: telefono, celular, email, direccion, otro"),
    (0, express_validator_1.body)("contacto.valor")
        .isString()
        .withMessage("El valor del contacto debe ser texto")
        .notEmpty()
        .withMessage("El valor del contacto es requerido")
        .isLength({ max: 255 })
        .withMessage("El valor del contacto no puede exceder 255 caracteres"),
    (0, express_validator_1.body)("contacto.es_principal")
        .optional()
        .isBoolean()
        .withMessage("es_principal debe ser booleano"),
    (0, express_validator_1.body)("contacto.activo")
        .optional()
        .isBoolean()
        .withMessage("activo debe ser booleano"),
];
exports.updateContactoHttpValidator = [
    (0, express_validator_1.body)("contacto")
        .isObject()
        .withMessage("El objeto contacto es requerido"),
    (0, express_validator_1.body)("contacto.tipo_contacto")
        .optional()
        .isIn(["telefono", "celular", "email", "direccion", "otro"])
        .withMessage("Tipo de contacto inválido"),
    (0, express_validator_1.body)("contacto.valor")
        .optional()
        .isString()
        .withMessage("El valor del contacto debe ser texto")
        .isLength({ max: 255 })
        .withMessage("El valor del contacto no puede exceder 255 caracteres"),
    (0, express_validator_1.body)("contacto.es_principal")
        .optional()
        .isBoolean()
        .withMessage("es_principal debe ser booleano"),
    (0, express_validator_1.body)("contacto.activo")
        .optional()
        .isBoolean()
        .withMessage("activo debe ser booleano"),
];
exports.bulkCreateContactoHttpValidator = [
    (0, express_validator_1.body)("contactos")
        .isArray({ min: 1 })
        .withMessage("Se requiere un array de contactos con al menos un elemento"),
    (0, express_validator_1.body)("contactos.*.persona_id")
        .isInt({ min: 1 })
        .withMessage("Cada contacto debe tener un persona_id válido"),
    (0, express_validator_1.body)("contactos.*.tipo_contacto")
        .isIn(["telefono", "celular", "email", "direccion", "otro"])
        .withMessage("Tipo de contacto inválido en array"),
    (0, express_validator_1.body)("contactos.*.valor")
        .isString()
        .notEmpty()
        .withMessage("Cada contacto debe tener un valor")
        .isLength({ max: 255 })
        .withMessage("El valor no puede exceder 255 caracteres"),
];
exports.contactoIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID inválido"),
];
exports.personaIdValidator = [
    (0, express_validator_1.param)("personaId").isInt({ min: 1 }).withMessage("ID de persona inválido"),
];
exports.searchContactoValidator = [
    (0, express_validator_1.query)("tipo")
        .optional()
        .isIn(["telefono", "celular", "email", "direccion", "otro"])
        .withMessage("Tipo de contacto inválido"),
    (0, express_validator_1.query)("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Página debe ser un número positivo"),
    (0, express_validator_1.query)("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Límite debe estar entre 1 y 100"),
];
// Legacy exports
exports.createContactoValidator = exports.createContactoHttpValidator;
exports.updateContactoValidator = exports.updateContactoHttpValidator;
exports.bulkCreateContactoValidator = exports.bulkCreateContactoHttpValidator;
//# sourceMappingURL=contacto.validators.js.map