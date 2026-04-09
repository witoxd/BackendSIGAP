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
exports.validateBulkCreateContactoDomain = exports.validateUpdateContactoDomain = exports.validateCreateContactoDomain = void 0;
const Contacto_1 = require("../../models/sequelize/Contacto");
const sequelize_1 = require("sequelize");
const validateCreateContactoDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contacto: ContactoData } = req.body;
        // Validación dominio con Sequelize (NO DB)
        yield Contacto_1.Contacto.build(ContactoData).validate({ skip: ["persona_id"] });
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
exports.validateCreateContactoDomain = validateCreateContactoDomain;
const validateUpdateContactoDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contacto: ContactoData } = req.body;
        if (ContactoData && Object.keys(ContactoData).length > 0) {
            yield Contacto_1.Contacto.build(ContactoData).validate({
                skip: ["contacto_id", "persona_id"],
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
exports.validateUpdateContactoDomain = validateUpdateContactoDomain;
const validateBulkCreateContactoDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contactos } = req.body;
        if (!Array.isArray(contactos) || contactos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Se requiere un array de contactos",
            });
        }
        // Validar cada contacto
        for (let i = 0; i < contactos.length; i++) {
            yield Contacto_1.Contacto.build(contactos[i]).validate({ skip: ["persona_id"] });
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
exports.validateBulkCreateContactoDomain = validateBulkCreateContactoDomain;
//# sourceMappingURL=contacto.domain.js.map