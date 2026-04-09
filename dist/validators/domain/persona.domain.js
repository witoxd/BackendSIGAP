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
exports.validateUpdatePersonaDomain = exports.validateCreatePersonaDomain = void 0;
const Persona_1 = require("../../models/sequelize/Persona");
const sequelize_1 = require("sequelize");
const validateCreatePersonaDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { persona: persona } = req.body;
        // Validacion dominio con Sequelize (NO DB)
        yield Persona_1.Persona.build(persona).validate();
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
exports.validateCreatePersonaDomain = validateCreatePersonaDomain;
const validateUpdatePersonaDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { persona: persona } = req.body;
        yield Persona_1.Persona.build(persona).validate({ skip: ["tipo_documento_id", "numero_documento"] });
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
exports.validateUpdatePersonaDomain = validateUpdatePersonaDomain;
//# sourceMappingURL=persona.domain.js.map