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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPasswordDomain = exports.validateCreateUserWithPersonaDomain = exports.validateCreateUserDomain = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
const Persona_1 = require("../../models/sequelize/Persona");
const Usuario_1 = require("../../models/sequelize/Usuario");
const AppError_1 = require("../../utils/AppError");
const handleSequelizeValidationError = (res, error) => res.status(400).json({
    success: false,
    message: "Error de validacion de dominio",
    errors: error.errors.map((e) => ({
        field: e.path,
        message: e.message,
    })),
});
const validateCreateUserDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const personaId = Number(req.params.personaId);
        const { user } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(user.contraseña, 10);
        yield Usuario_1.Usuario.build({
            persona_id: personaId,
            username: user.username,
            email: user.email,
            contraseña: hashedPassword,
            activo: (_a = user.activo) !== null && _a !== void 0 ? _a : true,
        }).validate();
        return next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return handleSequelizeValidationError(res, error);
        }
        return next(error);
    }
});
exports.validateCreateUserDomain = validateCreateUserDomain;
const validateCreateUserWithPersonaDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { user, persona } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(user.contraseña, 10);
        yield Usuario_1.Usuario.build({
            persona_id: 1,
            username: user.username,
            email: user.email,
            contraseña: hashedPassword,
            activo: (_a = user.activo) !== null && _a !== void 0 ? _a : true,
        }).validate();
        yield Persona_1.Persona.build(persona).validate();
        return next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return handleSequelizeValidationError(res, error);
        }
        return next(error);
    }
});
exports.validateCreateUserWithPersonaDomain = validateCreateUserWithPersonaDomain;
const validateResetPasswordDomain = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const personaId = Number(req.params.id);
        const personaResult = yield (0, database_1.query)("SELECT persona_id FROM personas WHERE persona_id = $1", [personaId]);
        if (personaResult.rows.length === 0) {
            throw new AppError_1.NotFoundError("Persona no encontrada");
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
});
exports.validateResetPasswordDomain = validateResetPasswordDomain;
//# sourceMappingURL=auth.domain.js.map