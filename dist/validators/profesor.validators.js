"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfesorValidator = exports.createProfesorValidator = exports.updateProfesorHttpValidator = exports.createProfesorHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createProfesorHttpValidator = [
    (0, express_validator_1.body)("profesor")
        .isObject()
        .withMessage("El objeto profesor es requerido"),
    (0, express_validator_1.body)("persona")
        .isObject()
        .withMessage("El objeto persona es requerido"),
    (0, express_validator_1.body)("profesor.sede_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de sede debe ser un numero valido"),
    (0, express_validator_1.body)("profesor.fecha_contratacion")
        .optional()
        .isISO8601()
        .withMessage("La fecha de contratacion debe ser una fecha valida"),
    (0, express_validator_1.body)("profesor.estado")
        .optional()
        .isIn(["activo", "inactivo"])
        .withMessage("El estado debe ser activo o inactivo"),
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
exports.updateProfesorHttpValidator = [
    (0, express_validator_1.body)("profesor")
        .optional()
        .isObject()
        .withMessage("El objeto profesor debe ser un objeto"),
    (0, express_validator_1.body)("persona")
        .optional()
        .isObject()
        .withMessage("El objeto persona debe ser un objeto"),
    (0, express_validator_1.body)("profesor.sede_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de sede debe ser un numero valido"),
    (0, express_validator_1.body)("profesor.fecha_contratacion")
        .optional()
        .isISO8601()
        .withMessage("La fecha de contratacion debe ser una fecha valida"),
    (0, express_validator_1.body)("profesor.estado")
        .optional()
        .isIn(["activo", "inactivo"])
        .withMessage("El estado debe ser activo o inactivo"),
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
exports.createProfesorValidator = exports.createProfesorHttpValidator;
exports.updateProfesorValidator = exports.updateProfesorHttpValidator;
//# sourceMappingURL=profesor.validators.js.map