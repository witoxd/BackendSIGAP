"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHttpValidator = exports.createUserWithPersonaHttpValidator = exports.createUserHttpValidator = void 0;
const express_validator_1 = require("express-validator");
const persona_validators_1 = require("./persona.validators");
const passwordValidator = (field, label) => (0, express_validator_1.body)(field)
    .isString()
    .withMessage(`${label} debe ser texto`)
    .isLength({ min: 8 })
    .withMessage(`${label} debe tener al menos 8 caracteres`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage(`${label} debe contener al menos una mayuscula y una minuscula`);
const userBaseHttpValidator = [
    (0, express_validator_1.body)("user")
        .isObject()
        .withMessage("El objeto user es requerido"),
    (0, express_validator_1.body)("user.username")
        .isString()
        .withMessage("El username debe ser texto")
        .isLength({ min: 3, max: 50 })
        .withMessage("El username debe tener entre 3 y 50 caracteres")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("El username solo puede contener letras, numeros y guiones bajos"),
    (0, express_validator_1.body)("user.email")
        .isEmail()
        .withMessage("El email es invalido")
        .normalizeEmail(),
    passwordValidator("user.contraseña", "La contraseña"),
    (0, express_validator_1.body)("user.activo")
        .optional()
        .isBoolean()
        .withMessage("El campo activo debe ser booleano"),
];
exports.createUserHttpValidator = [
    (0, express_validator_1.param)("personaId")
        .isInt({ min: 1 })
        .withMessage("El personaId debe ser un numero entero positivo"),
    ...userBaseHttpValidator,
    (0, express_validator_1.body)("role")
        .isString()
        .withMessage("El rol debe ser texto")
        .isIn(["admin", "estudiante", "profesor", "administrativo"])
        .withMessage("El rol debe ser admin, estudiante, profesor o administrativo"),
];
exports.createUserWithPersonaHttpValidator = [
    ...userBaseHttpValidator,
    (0, express_validator_1.body)("persona")
        .isObject()
        .withMessage("El objeto persona es requerido"),
    ...persona_validators_1.createPersonaHttpValidator,
    (0, express_validator_1.body)("role")
        .isString()
        .withMessage("El rol debe ser texto")
        .isIn(["admin", "estudiante", "profesor", "administrativo"])
        .withMessage("El rol debe ser admin, estudiante, profesor o administrativo"),
];
exports.resetPasswordHttpValidator = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("El ID de persona debe ser un numero entero positivo"),
];
//# sourceMappingURL=auth.validators.js.map