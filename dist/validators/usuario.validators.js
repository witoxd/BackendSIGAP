"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsuarioValidator = exports.createUsuarioValidator = exports.updateUsuarioHttpValidator = exports.createUsuarioHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createUsuarioHttpValidator = [
    (0, express_validator_1.body)("usuario")
        .isObject()
        .withMessage("El objeto usuario es requerido"),
    (0, express_validator_1.body)("persona")
        .isObject()
        .withMessage("El objeto persona es requerido"),
    (0, express_validator_1.body)("usuario.username")
        .isString()
        .withMessage("El username debe ser texto")
        .notEmpty()
        .withMessage("El username es requerido")
        .isLength({ min: 3, max: 50 })
        .withMessage("El username debe tener entre 3 y 50 caracteres")
        .isAlphanumeric()
        .withMessage("El username solo debe contener letras y numeros"),
    (0, express_validator_1.body)("usuario.email")
        .isEmail()
        .withMessage("El email debe ser un correo valido")
        .normalizeEmail(),
    (0, express_validator_1.body)("usuario.contraseña")
        .isString()
        .withMessage("La contrasena debe ser texto")
        .notEmpty()
        .withMessage("La contrasena es requerida")
        .isLength({ min: 8 })
        .withMessage("La contrasena debe tener al menos 8 caracteres"),
    (0, express_validator_1.body)("usuario.activo")
        .optional()
        .isBoolean()
        .withMessage("El estado activo debe ser booleano"),
    // Persona fields
    (0, express_validator_1.body)("persona.nombres")
        .isString()
        .withMessage("Los nombres deben ser texto")
        .notEmpty()
        .withMessage("Los nombres son requeridos"),
    (0, express_validator_1.body)("persona.apellido_paterno")
        .optional()
        .isString()
        .withMessage("El apellido paterno debe ser texto"),
    (0, express_validator_1.body)("persona.apellido_materno")
        .optional()
        .isString()
        .withMessage("El apellido materno debe ser texto"),
    (0, express_validator_1.body)("persona.tipo_documento_id")
        .isInt({ min: 1 })
        .withMessage("El tipo de documento es requerido"),
    (0, express_validator_1.body)("persona.numero_documento")
        .isString()
        .withMessage("El numero de documento debe ser texto")
        .notEmpty()
        .withMessage("El numero de documento es requerido"),
    (0, express_validator_1.body)("persona.fecha_nacimiento")
        .isISO8601()
        .withMessage("La fecha de nacimiento debe ser una fecha valida"),
    (0, express_validator_1.body)("persona.genero")
        .isIn(["Masculino", "Femenino", "Otro"])
        .withMessage("El genero debe ser Masculino, Femenino u Otro"),
];
exports.updateUsuarioHttpValidator = [
    (0, express_validator_1.body)("usuario")
        .optional()
        .isObject()
        .withMessage("El objeto usuario debe ser un objeto"),
    (0, express_validator_1.body)("persona")
        .optional()
        .isObject()
        .withMessage("El objeto persona debe ser un objeto"),
    (0, express_validator_1.body)("usuario.username")
        .optional()
        .isString()
        .withMessage("El username debe ser texto")
        .isLength({ min: 3, max: 50 })
        .withMessage("El username debe tener entre 3 y 50 caracteres")
        .isAlphanumeric()
        .withMessage("El username solo debe contener letras y numeros"),
    (0, express_validator_1.body)("usuario.email")
        .optional()
        .isEmail()
        .withMessage("El email debe ser un correo valido")
        .normalizeEmail(),
    (0, express_validator_1.body)("usuario.contraseña")
        .optional()
        .isString()
        .withMessage("La contrasena debe ser texto")
        .isLength({ min: 8 })
        .withMessage("La contrasena debe tener al menos 8 caracteres"),
    (0, express_validator_1.body)("usuario.activo")
        .optional()
        .isBoolean()
        .withMessage("El estado activo debe ser booleano"),
    // Persona fields (optional for update)
    (0, express_validator_1.body)("persona.nombres")
        .optional()
        .isString()
        .withMessage("Los nombres deben ser texto"),
    (0, express_validator_1.body)("persona.apellido_paterno")
        .optional()
        .isString()
        .withMessage("El apellido paterno debe ser texto"),
    (0, express_validator_1.body)("persona.apellido_materno")
        .optional()
        .isString()
        .withMessage("El apellido materno debe ser texto"),
];
// Legacy exports for backward compatibility
exports.createUsuarioValidator = exports.createUsuarioHttpValidator;
exports.updateUsuarioValidator = exports.updateUsuarioHttpValidator;
//# sourceMappingURL=usuario.validators.js.map