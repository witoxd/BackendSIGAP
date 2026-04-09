"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpsertExpedienteDomain = exports.validateUpsertViviendaDomain = exports.validateUpdateColegioDomain = exports.validateReplaceColegiosDomain = exports.validateCreateColegioDomain = exports.validateUpsertFichaDomain = void 0;
const FichaEstudiante_1 = require("../../models/sequelize/FichaEstudiante");
const ColegioAnterior_1 = require("../../models/sequelize/ColegioAnterior");
const ViviendaEstudiante_1 = require("../../models/sequelize/ViviendaEstudiante");
const sequelize_1 = require("sequelize");
// =============================================================================
// FICHA ESTUDIANTE
// =============================================================================
const validateUpsertFichaDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ficha } = req.body;
        yield FichaEstudiante_1.FichaEstudiante.build(ficha).validate({ skip: ["estudiante_id"] });
        // Regla de negocio adicional que Sequelize no puede expresar:
        // posicion_hermanos no puede ser mayor que numero_hermanos
        // (no puedes ser el 5to hijo si solo hay 3 hermanos)
        if (ficha.posicion_hermanos !== undefined &&
            ficha.numero_hermanos !== undefined &&
            ficha.posicion_hermanos > ficha.numero_hermanos) {
            return res.status(400).json({
                success: false,
                message: "Error de validación de dominio",
                errors: [{
                        field: "ficha.posicion_hermanos",
                        message: "La posición entre hermanos no puede ser mayor al número de hermanos",
                    }],
            });
        }
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validación de dominio",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateUpsertFichaDomain = validateUpsertFichaDomain;
// =============================================================================
// COLEGIOS ANTERIORES — crear uno
// =============================================================================
const validateCreateColegioDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { colegio } = req.body;
        yield ColegioAnterior_1.ColegioAnterior.build(colegio).validate({ skip: ["estudiante_id"] });
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validación de dominio",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateCreateColegioDomain = validateCreateColegioDomain;
// =============================================================================
// COLEGIOS ANTERIORES — replaceAll
// =============================================================================
const validateReplaceColegiosDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { colegios } = req.body;
        // Validar cada elemento con el modelo Sequelize
        for (const colegio of colegios) {
            yield ColegioAnterior_1.ColegioAnterior.build(colegio).validate({ skip: ["estudiante_id"] });
        }
        // Regla de negocio: no puede haber duplicados de nombre_colegio + anio
        // en la misma lista (no tiene sentido el mismo colegio dos veces en el mismo año)
        const seen = new Set();
        for (const c of colegios) {
            const key = `${(_a = c.nombre_colegio) === null || _a === void 0 ? void 0 : _a.toLowerCase()}-${(_b = c.anio) !== null && _b !== void 0 ? _b : "s/a"}`;
            if (seen.has(key)) {
                return res.status(400).json({
                    success: false,
                    message: "Error de validación de dominio",
                    errors: [{
                            field: "colegios",
                            message: `El colegio "${c.nombre_colegio}" aparece duplicado en la lista`,
                        }],
                });
            }
            seen.add(key);
        }
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validación de dominio",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateReplaceColegiosDomain = validateReplaceColegiosDomain;
// =============================================================================
// COLEGIOS ANTERIORES — actualizar uno
// =============================================================================
const validateUpdateColegioDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { colegio } = req.body;
        // Se salta nombre_colegio porque en update es opcional
        yield ColegioAnterior_1.ColegioAnterior.build(colegio).validate({
            skip: ["estudiante_id", "nombre_colegio"],
        });
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validación de dominio",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateUpdateColegioDomain = validateUpdateColegioDomain;
// =============================================================================
// VIVIENDA ESTUDIANTE
// =============================================================================
const validateUpsertViviendaDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vivienda } = req.body;
        yield ViviendaEstudiante_1.ViviendaEstudiante.build(vivienda).validate({ skip: ["estudiante_id"] });
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validación de dominio",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateUpsertViviendaDomain = validateUpsertViviendaDomain;
// =============================================================================
// EXPEDIENTE COMPLETO
// Valida cada sección presente usando sus propios modelos Sequelize.
// Las secciones ausentes se saltan — el expediente se puede guardar parcialmente.
// =============================================================================
const validateUpsertExpedienteDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { ficha, colegios, vivienda } = req.body;
        if (ficha) {
            yield FichaEstudiante_1.FichaEstudiante.build(ficha).validate({ skip: ["estudiante_id"] });
            if (ficha.posicion_hermanos !== undefined &&
                ficha.numero_hermanos !== undefined &&
                ficha.posicion_hermanos > ficha.numero_hermanos) {
                return res.status(400).json({
                    success: false,
                    message: "Error de validación de dominio",
                    errors: [{
                            field: "ficha.posicion_hermanos",
                            message: "La posición entre hermanos no puede ser mayor al número de hermanos",
                        }],
                });
            }
        }
        if (colegios) {
            for (const colegio of colegios) {
                yield ColegioAnterior_1.ColegioAnterior.build(colegio).validate({ skip: ["estudiante_id"] });
            }
            const seen = new Set();
            for (const c of colegios) {
                const key = `${(_a = c.nombre_colegio) === null || _a === void 0 ? void 0 : _a.toLowerCase()}-${(_b = c.anio) !== null && _b !== void 0 ? _b : "s/a"}`;
                if (seen.has(key)) {
                    return res.status(400).json({
                        success: false,
                        message: "Error de validación de dominio",
                        errors: [{
                                field: "colegios",
                                message: `El colegio "${c.nombre_colegio}" aparece duplicado en la lista`,
                            }],
                    });
                }
                seen.add(key);
            }
        }
        if (vivienda) {
            yield ViviendaEstudiante_1.ViviendaEstudiante.build(vivienda).validate({ skip: ["estudiante_id"] });
        }
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validación de dominio",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateUpsertExpedienteDomain = validateUpsertExpedienteDomain;
//# sourceMappingURL=fichaEstudiante.domain.js.map