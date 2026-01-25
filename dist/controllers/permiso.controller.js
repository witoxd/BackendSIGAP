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
class PermisoController {
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit } = req.query;
                const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
                const permisos = yield PermisoRepository_1.PermisoRepository.findAll(pLimit, offset);
                res.status(200).json({
                    success: true,
                    data: permisos,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const permiso = yield PermisoRepository_1.PermisoRepository.findById(id);
                if (!permiso) {
                    throw new AppError_1.AppError("Permiso no encontrado", 404);
                }
                res.status(200).json({
                    success: true,
                    data: permiso,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getByRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roleId = Number(req.params.roleId);
                const permisos = yield PermisoRepository_1.PermisoRepository.findByRole(roleId);
                res.status(200).json({
                    success: true,
                    data: permisos,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    assignToRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { role_id, permiso_id } = req.body;
                const result = yield PermisoRepository_1.PermisoRepository.assignToRole(role_id, permiso_id);
                res.status(200).json({
                    success: true,
                    message: "Permiso asignado al rol exitosamente",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    removeFromRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roleId, permisoId } = req.params;
                const result = yield PermisoRepository_1.PermisoRepository.removeFromRole(Number(roleId), Number(permisoId));
                if (!result) {
                    throw new AppError_1.AppError("Permiso no encontrado en este rol", 404);
                }
                res.status(200).json({
                    success: true,
                    message: "Permiso removido del rol exitosamente",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    checkPermission(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.PermisoController = PermisoController;
//# sourceMappingURL=permiso.controller.js.map