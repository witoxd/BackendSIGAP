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
exports.validateUpdateJornadaDomain = exports.validateCreateJornadaDomain = void 0;
const Jornada_1 = require("../../models/sequelize/Jornada");
const sequelize_1 = require("sequelize");
const validateCreateJornadaDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jornada = req.body;
        // Validacion dominio con Sequelize (NO DB)
        yield Jornada_1.Jornada.build(jornada).validate();
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
exports.validateCreateJornadaDomain = validateCreateJornadaDomain;
const validateUpdateJornadaDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jornada = req.body;
        yield Jornada_1.Jornada.build(jornada).validate();
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
exports.validateUpdateJornadaDomain = validateUpdateJornadaDomain;
//# sourceMappingURL=jornada.domain.js.map