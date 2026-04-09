"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archivoValidators = exports.updateArchivoValidator = exports.createArchivoValidator = exports.searchArchivoValidator = exports.archivoIdValidator = exports.updateArchivoHttpValidator = exports.bulkCreateArchivoHttpValidator = exports.createArchivoHttpValidator = void 0;
const express_validator_1 = require("express-validator");
// ============================================================================
// VALIDADORES HTTP PARA ARCHIVOS (form-data)
// ============================================================================
// NOTA: Los campos vienen en form-data (no en JSON anidado)
// porque se usa multer para subida de archivos.
// El campo "url_archivo" NO se valida aqui porque se genera
// automaticamente desde el archivo subido por multer.
/**
 * Validador HTTP para crear archivo
 */
exports.createArchivoHttpValidator = [
    (0, express_validator_1.body)("persona_id")
        .notEmpty()
        .withMessage("El ID de persona es requerido")
        .isInt({ min: 1 })
        .withMessage("El ID de persona debe ser un entero positivo"),
    (0, express_validator_1.body)("nombre")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .isLength({ max: 200 })
        .withMessage("El nombre no puede exceder 200 caracteres"),
    (0, express_validator_1.body)("metadata.descripcion")
        .optional()
        .isString()
        .withMessage("La descripcion debe ser texto"),
    (0, express_validator_1.body)("metadata.tipo_archivo_id")
        .optional()
        // .withMessage("El tipo de archivo es requerido")
        .isInt({ min: 1 })
        .withMessage("Tipo de archivo invalido)"),
];
exports.bulkCreateArchivoHttpValidator = [
    (0, express_validator_1.body)("persona_id")
        .notEmpty()
        .withMessage("El ID de persona es requerido")
        .isInt({ min: 1 })
        .withMessage("El ID de persona debe ser un entero positivo"),
    (0, express_validator_1.body)("nombre")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .isLength({ max: 200 })
        .withMessage("El nombre no puede exceder 200 caracteres"),
    (0, express_validator_1.body)("metadata.*.descripcion")
        .optional()
        .isString()
        .withMessage("La descripcion debe ser texto"),
    (0, express_validator_1.body)("metadata.*.tipo_archivo_id")
        .optional()
        // .withMessage("El tipo de archivo es requerido")
        .isInt({ min: 1 })
        .withMessage("Tipo de archivo invalido)"),
];
/**
 * Validador HTTP para actualizar archivo
 * Todos los campos son opcionales en actualizacion
 */
exports.updateArchivoHttpValidator = [
    (0, express_validator_1.body)("nombre")
        .optional()
        .isString()
        .withMessage("El nombre debe ser texto")
        .isLength({ max: 200 })
        .withMessage("El nombre no puede exceder 200 caracteres"),
    (0, express_validator_1.body)("descripcion")
        .optional()
        .isString()
        .withMessage("La descripcion debe ser texto"),
    (0, express_validator_1.body)("tipo_archivo")
        .optional()
        .isIn(["certificado", "diploma", "constancia", "carta", "otro"])
        .withMessage("Tipo de archivo invalido. Valores permitidos: certificado, diploma, constancia, carta, otro"),
    (0, express_validator_1.body)("activo")
        .optional()
        .custom((value) => {
        // En form-data, los booleanos pueden venir como strings
        if (value === "true" || value === "false" || typeof value === "boolean") {
            return true;
        }
        throw new Error("El campo activo debe ser booleano");
    }),
];
// ============================================================================
// VALIDADORES ADICIONALES
// ============================================================================
exports.archivoIdValidator = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido"),
];
exports.searchArchivoValidator = [
    (0, express_validator_1.query)("tipo_archivo")
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage("Tipo de archivo invalido"),
    (0, express_validator_1.query)("persona_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("persona_id debe ser un numero positivo"),
    (0, express_validator_1.query)("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Pagina debe ser un numero positivo"),
    (0, express_validator_1.query)("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limite debe estar entre 1 y 100"),
];
// ============================================================================
// EXPORTACIONES DE COMPATIBILIDAD (legacy)
// ============================================================================
exports.createArchivoValidator = exports.createArchivoHttpValidator;
exports.updateArchivoValidator = exports.updateArchivoHttpValidator;
exports.archivoValidators = {
    createArchivoHttpValidator: exports.createArchivoHttpValidator,
    updateArchivoHttpValidator: exports.updateArchivoHttpValidator,
    archivoIdValidator: exports.archivoIdValidator,
    searchArchivoValidator: exports.searchArchivoValidator,
};
//# sourceMappingURL=archivo.validators.js.map