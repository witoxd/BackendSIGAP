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
exports.PermisoController = void 0;
const PermisoRepository_1 = require("../models/Repository/PermisoRepository");
const AppError_1 = require("../utils/AppError");
const validators_1 = require("../utils/validators");
const asyncHandler_1 = require("../utils/asyncHandler");
class PermisoController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit } = req.query;
            const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
            const permisos = yield PermisoRepository_1.PermisoRepository.findAll(pLimit, offset);
            res.status(200).json({
                success: true,
                data: permisos,
            });
        }));
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const permiso = yield PermisoRepository_1.PermisoRepository.findById(id);
            if (!permiso) {
                throw new AppError_1.AppError("Permiso no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: permiso,
            });
        }));
        this.getByRole = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const roleId = Number(req.params.roleId);
            const permisos = yield PermisoRepository_1.PermisoRepository.findByRole(roleId);
            res.status(200).json({
                success: true,
                data: permisos,
            });
        }));
        this.assignToRole = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { role_id, permiso_id } = req.body;
            const result = yield PermisoRepository_1.PermisoRepository.assignToRole(role_id, permiso_id);
            res.status(200).json({
                success: true,
                message: "Permiso asignado al rol exitosamente",
                data: result,
            });
        }));
        this.removeFromRole = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { roleId, permisoId } = req.params;
            const result = yield PermisoRepository_1.PermisoRepository.removeFromRole(Number(roleId), Number(permisoId));
            if (!result) {
                throw new AppError_1.AppError("Permiso no encontrado en este rol", 404);
            }
            res.status(200).json({
                success: true,
                message: "Permiso removido del rol exitosamente",
            });
        }));
        this.checkPermission = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { roleId } = req.params;
            const { recurso, accion } = req.query;
            if (!recurso || !accion) {
                throw new AppError_1.AppError("Recurso y acción son requeridos", 400);
            }
            const tienePermiso = yield PermisoRepository_1.PermisoRepository.checkPermission(Number(roleId), recurso, accion);
            res.status(200).json({
                success: true,
                data: { tienePermiso },
            });
        }));
    }
}
exports.PermisoController = PermisoController;
//# sourceMappingURL=permiso.controller.js.map