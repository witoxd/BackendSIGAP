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
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const authService = new auth_service_1.AuthService();
class AuthController {
    constructor() {
        this.register = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const result = yield authService.register(req.body);
            res.status(201).json({
                success: true,
                message: "Usuario registrado exitosamente",
                data: result,
            });
        }));
        this.login = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { email, contraseña } = req.body;
            const result = yield authService.login(email, contraseña);
            res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                data: result,
            });
        }));
        this.changePassword = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;
            const result = yield authService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }));
        this.me = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.status(200).json({
                success: true,
                message: "Contraseña restablecida exitosamente",
                data: req.user,
            });
        }));
        this.createUserWithPersona = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { user: userData, persona: personaData, role } = req.body;
            const result = yield authService.createUserWithPersona(userData, personaData, role);
            res.status(201).json({
                success: true,
                message: "Usuario y persona creados exitosamente",
                data: result,
            });
        }));
        this.createUser = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const personaId = Number(req.params.personaId);
            const { user: userData, role } = req.body;
            const result = yield authService.createUser(userData, personaId, role);
            res.status(201).json({
                success: true,
                message: "Usuario creado exitosamente",
                data: result,
            });
        }));
        this.resetPassword = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const personaId = Number(req.params.id);
            const result = yield authService.resetPasswordByDefaultDocument(personaId);
            res.status(200).json({
                success: true,
                message: "Contraseña restablecida exitosamente",
                data: result,
            });
        }));
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map