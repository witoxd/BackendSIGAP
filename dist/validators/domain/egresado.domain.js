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
exports.validateUpdateEgresadoDomain = exports.validateCreateEgresadoDomain = void 0;
const Egresado_1 = require("../../models/sequelize/Egresado");
const sequelize_1 = require("sequelize");
const validateCreateEgresadoDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { egresado: EgresadoData } = req.body;
        // Validacion dominio con Sequelize (NO DB)
        yield Egresado_1.Egresado.build(EgresadoData).validate();
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validacion de dominio",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateCreateEgresadoDomain = validateCreateEgresadoDomain;
const validateUpdateEgresadoDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const egresado = req.body;
        yield Egresado_1.Egresado.build(egresado).validate({ skip: ["estudiante_id"] });
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validacion de dominio",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateUpdateEgresadoDomain = validateUpdateEgresadoDomain;
//# sourceMappingURL=egresado.domain.js.map