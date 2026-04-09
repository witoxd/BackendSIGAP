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
exports.validateUpdateTipoArchivoDomain = exports.validateCreateTipoArchivoDomain = void 0;
const TipoArchivo_1 = require("../../models/sequelize/TipoArchivo");
const sequelize_1 = require("sequelize");
const validateCreateTipoArchivoDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tipo_archivo: TipoArchivoData } = req.body;
        // Validación dominio con Sequelize (NO DB)
        yield TipoArchivo_1.TipoArchivo.build(TipoArchivoData).validate();
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validación de dominio",
                errors: error.errors.map((e) => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateCreateTipoArchivoDomain = validateCreateTipoArchivoDomain;
const validateUpdateTipoArchivoDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tipo_archivo: TipoArchivoData } = req.body;
        if (TipoArchivoData && Object.keys(TipoArchivoData).length > 0) {
            yield TipoArchivo_1.TipoArchivo.build(TipoArchivoData).validate({
                skip: ["tipo_archivo_id", "nombre"],
            });
        }
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validación de dominio",
                errors: error.errors.map((e) => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateUpdateTipoArchivoDomain = validateUpdateTipoArchivoDomain;
//# sourceMappingURL=tipoArchivo.domain.js.map