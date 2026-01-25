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
const authService = new auth_service_1.AuthService();
class AuthController {
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield authService.register(req.body);
                res.status(201).json({
                    success: true,
                    message: "Usuario registrado exitosamente",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, contraseña } = req.body;
                const result = yield authService.login(email, contraseña);
                res.status(200).json({
                    success: true,
                    message: "Inicio de sesión exitoso",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const { currentPassword, newPassword } = req.body;
                const result = yield authService.changePassword(userId, currentPassword, newPassword);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    me(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(200).json({
                    success: true,
                    data: req.user,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map