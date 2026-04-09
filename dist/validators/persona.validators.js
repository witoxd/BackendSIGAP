"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personaBaseValidator = exports.updatePersonaValidator = exports.createPersonaValidator = exports.updatePersonaHttpValidator = exports.createPersonaHttpValidator = exports.personaBaseHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.personaBaseHttpValidator = [
    (0, express_validator_1.body)("persona.numero_documento")
        .isString()
        .withMessage("El numero de documento debe ser texto")
        .notEmpty()
        .withMessage("El numero de documento es requerido")
];
exports.createPersonaHttpValidator = [
    (0, express_validator_1.body)("persona.nombres")
        .isString()
        .withMessage("Los nombres deben ser texto")
        .notEmpty()
        .withMessage("Los nombres son requeridos")
        .isLength({ min: 2, max: 100 })
        .withMessage("Los nombres deben tener entre 2 y 100 caracteres"),
    (0, express_validator_1.body)("persona.apellido_paterno")
        .optional()
        .isString()
        .withMessage("El apellido paterno debe ser texto")
        .isLength({ min: 2, max: 50 })
        .withMessage("El apellido paterno debe tener entre 2 y 50 caracteres"),
    (0, express_validator_1.body)("persona.apellido_materno")
        .optional()
        .isString()
        .withMessage("El apellido materno debe ser texto")
        .isLength({ min: 2, max: 50 })
        .withMessage("El apellido materno debe tener entre 2 y 50 caracteres"),
    (0, express_validator_1.body)("persona.tipo_documento_id")
        .isInt({ min: 1 })
        .withMessage("El tipo de documento es requerido y debe ser un numero valido"),
    (0, express_validator_1.body)("persona.numero_documento")
        .isString()
        .withMessage("El numero de documento debe ser texto")
        .notEmpty()
        .withMessage("El numero de documento es requerido")
        .isLength({ min: 5, max: 20 })
        .withMessage("El numero de documento debe tener entre 5 y 20 caracteres"),
    (0, express_validator_1.body)("persona.fecha_nacimiento")
        .isISO8601()
        .withMessage("La fecha de nacimiento debe ser una fecha valida"),
    (0, express_validator_1.body)("persona.genero")
        .isIn(["Masculino", "Femenino", "Otro"])
        .withMessage("El genero debe ser Masculino, Femenino u Otro"),
];
exports.updatePersonaHttpValidator = [
    (0, express_validator_1.body)("persona.nombres")
        .optional()
        .isString()
        .withMessage("Los nombres deben ser texto")
        .isLength({ min: 2, max: 100 })
        .withMessage("Los nombres deben tener entre 2 y 100 caracteres"),
    (0, express_validator_1.body)("persona.apellido_paterno")
        .optional()
        .isString()
        .withMessage("El apellido paterno debe ser texto")
        .isLength({ min: 2, max: 50 })
        .withMessage("El apellido paterno debe tener entre 2 y 50 caracteres"),
    (0, express_validator_1.body)("persona.apellido_materno")
        .optional()
        .isString()
        .withMessage("El apellido materno debe ser texto")
        .isLength({ min: 2, max: 50 })
        .withMessage("El apellido materno debe tener entre 2 y 50 caracteres"),
    (0, express_validator_1.body)("persona.tipo_documento_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El tipo de documento debe ser un numero valido"),
    (0, express_validator_1.body)("persona.numero_documento")
        .optional()
        .isString()
        .withMessage("El numero de documento debe ser texto")
        .isLength({ min: 5, max: 20 })
        .withMessage("El numero de documento debe tener entre 5 y 20 caracteres"),
    (0, express_validator_1.body)("persona.fecha_nacimiento")
        .optional()
        .isISO8601()
        .withMessage("La fecha de nacimiento debe ser una fecha valida"),
    (0, express_validator_1.body)("persona.genero")
        .optional()
        .isIn(["Masculino", "Femenino", "Otro"])
        .withMessage("El genero debe ser Masculino, Femenino u Otro"),
];
// Legacy exports for backward compatibility
exports.createPersonaValidator = exports.createPersonaHttpValidator;
exports.updatePersonaValidator = exports.updatePersonaHttpValidator;
exports.personaBaseValidator = exports.personaBaseHttpValidator;
//# sourceMappingURL=persona.validators.js.map