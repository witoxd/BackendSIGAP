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
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const userService = new user_service_1.UserService();
class UserController {
    constructor() {
        this.getUser = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = Number(req.params.id);
            const user = yield userService.getUserById(userId);
            res.status(200).json({
                success: true,
                data: user,
            });
        }));
        this.searchUsers = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { query, nombres, numero_documento, role, page = 1, limit = 10, sortBy, sortOrder } = req.query;
            const result = yield userService.searchUsers({
                query: query,
                nombres: nombres,
                numero_documento: numero_documento,
                role: role,
                pagination: {
                    page: Number.parseInt(page),
                    limit: Math.min(Number.parseInt(limit), 10), // Máximo 10 resultados
                    sortBy: sortBy,
                    sortOrder: sortOrder,
                },
            });
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }));
        this.assignAdmin = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const targetUserId = Number(req.params.id);
            const adminUserId = req.user.userId;
            const result = yield userService.assignAdminRole(targetUserId, adminUserId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }));
        this.transferAdmin = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const fromUserId = req.user.userId;
            const toUserId = Number.parseInt(req.body.toUserId);
            const result = yield userService.transferAdminRole(fromUserId, toUserId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }));
        this.toggleStatus = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = Number(req.params.id);
            const activo = req.params.activo === "true"; // Convertir a booleano
            const result = yield userService.toggleUserStatus(userId, activo);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }));
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map