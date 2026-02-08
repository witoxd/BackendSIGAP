"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEstudianteValidator = exports.createEstudianteValidator = exports.updateEstudianteHttpValidator = exports.createEstudianteHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// HTTP Validators - Validacion de estructura de request
exports.createEstudianteHttpValidator = [
    (0, express_validator_1.body)("estudiante")
        .isObject()
        .withMessage("El objeto estudiante es requerido"),
    (0, express_validator_1.body)("persona")
        .isObject()
        .withMessage("El objeto persona es requerido"),
    (0, express_validator_1.body)("estudiante.jornada_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de jornada debe ser un numero valido"),
    (0, express_validator_1.body)("estudiante.estado")
        .optional()
        .isIn(["activo", "inactivo", "graduado", "suspendido", "expulsado"])
        .withMessage("El estado debe ser activo, inactivo, graduado, suspendido o expulsado"),
    (0, express_validator_1.body)("estudiante.fecha_ingreso")
        .optional()
        .isISO8601()
        .withMessage("La fecha de ingreso debe ser una fecha valida"),
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
exports.updateEstudianteHttpValidator = [
    (0, express_validator_1.body)("estudiante")
        .optional()
        .isObject()
        .withMessage("El objeto estudiante debe ser un objeto"),
    (0, express_validator_1.body)("persona")
        .optional()
        .isObject()
        .withMessage("El objeto persona debe ser un objeto"),
    (0, express_validator_1.body)("estudiante.jornada_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El ID de jornada debe ser un numero valido"),
    (0, express_validator_1.body)("estudiante.estado")
        .optional()
        .isIn(["activo", "inactivo", "graduado", "suspendido", "expulsado"])
        .withMessage("El estado debe ser activo, inactivo, graduado, suspendido o expulsado"),
    (0, express_validator_1.body)("estudiante.fecha_ingreso")
        .optional()
        .isISO8601()
        .withMessage("La fecha de ingreso debe ser una fecha valida"),
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
exports.createEstudianteValidator = exports.createEstudianteHttpValidator;
exports.updateEstudianteValidator = exports.updateEstudianteHttpValidator;
//# sourceMappingURL=estudiante.validators.js.map