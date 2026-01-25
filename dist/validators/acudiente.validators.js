"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAcudienteValidator = exports.acudienteIdValidator = exports.assignAcudienteValidator = exports.updateAcudienteValidator = exports.createAcudienteValidator = exports.removeEstudianteToAcudienteHttpValidator = exports.assignAcudienteHttpValidator = exports.UpdateAcudienteHttpValidator = exports.CreateAcudienteHttpValidator = exports.updateAcudienteHttpValidator = exports.createAcudienteHttpValidator = void 0;
const express_validator_1 = require("express-validator");
const persona_validators_1 = require("./persona.validators");
// HTTP Validators - Validacion de estructura de request
exports.createAcudienteHttpValidator = [
    (0, express_validator_1.body)("acudiente")
        .isObject()
        .withMessage("El objeto acudiente es requerido"),
    (0, express_validator_1.body)("persona")
        .isObject()
        .withMessage("El objeto persona es requerido"),
    (0, express_validator_1.body)("acudiente.parentesco")
        .optional()
        .isString()
        .withMessage("El parentesco debe ser texto")
        .isLength({ max: 50 })
        .withMessage("El parentesco debe tener maximo 50 caracteres"),
];
exports.updateAcudienteHttpValidator = [
    (0, express_validator_1.body)("acudiente")
        .optional()
        .isObject()
        .withMessage("El objeto acudiente debe ser un objeto"),
    (0, express_validator_1.body)("persona")
        .optional()
        .isObject()
        .withMessage("El objeto persona debe ser un objeto"),
    (0, express_validator_1.body)("acudiente.parentesco")
        .optional()
        .isString()
        .withMessage("El parentesco debe ser texto")
        .isLength({ max: 50 })
        .withMessage("El parentesco debe tener maximo 50 caracteres"),
];
exports.CreateAcudienteHttpValidator = [
    ...exports.createAcudienteHttpValidator,
    ...persona_validators_1.personaBaseHttpValidator
];
exports.UpdateAcudienteHttpValidator = [
    ...persona_validators_1.updatePersonaHttpValidator,
    ...exports.updateAcudienteHttpValidator
];
exports.assignAcudienteHttpValidator = [
    (0, express_validator_1.body)("assignToEstudiante.estudiante_id")
        .isInt({ min: 1 })
        .withMessage("estudiante_id debe ser un numero positivo"),
    (0, express_validator_1.body)("assignToEstudiante.acudiente_id")
        .isInt({ min: 1 })
        .withMessage("acudiente_id debe ser un numero positivo"),
    (0, express_validator_1.body)("assignToEstudiante.tipo_relacion")
        .isString()
        .withMessage("Tiene que haber un tipo de relacion"),
    (0, express_validator_1.body)("assignToEstudiante.es_principal")
        .isBoolean()
        .withMessage("Debe ser verdadero o falso si es el acudiente principal")
];
exports.removeEstudianteToAcudienteHttpValidator = [
    (0, express_validator_1.param)("estudianteId")
        .isInt({ min: 1 })
        .withMessage("estudiante_id debe ser un numero positivo"),
    (0, express_validator_1.param)("acudienteId")
        .isInt({ min: 1 })
        .withMessage("acudiente_id debe ser un numero positivo"),
];
// Legacy exports for backward compatibility
exports.createAcudienteValidator = exports.CreateAcudienteHttpValidator;
exports.updateAcudienteValidator = exports.updateAcudienteHttpValidator;
exports.assignAcudienteValidator = exports.assignAcudienteHttpValidator;
exports.acudienteIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido")
];
exports.searchAcudienteValidator = [
    (0, express_validator_1.query)("estudiante_id").optional().isInt({ min: 1 }).withMessage("estudiante_id debe ser un numero positivo"),
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("Pagina debe ser un numero positivo"),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limite debe estar entre 1 y 100"),
];
//# sourceMappingURL=acudiente.validators.js.map