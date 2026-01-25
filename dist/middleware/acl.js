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
exports.canCreateUser = exports.isAdmin = exports.checkPermission = void 0;
const AppError_1 = require("../utils/AppError");
const RoleRepository_1 = require("../models/Repository/RoleRepository");
const PermisoRepository_1 = require("../models/Repository/PermisoRepository");
// Middleware para verificar permisos ACL
const checkPermission = (recurso, accion) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new AppError_1.UnauthorizedError("Usuario no autenticado");
            }
            const roles = req.user.roles;
            // Admin tiene acceso a todo
            if (roles.includes("admin")) {
                return next();
            }
            let rolesArray = [];
            if (typeof roles === "string") {
                rolesArray = roles
                    .replace(/[{}]/g, "")
                    .split(",")
                    .map(r => r.trim());
            }
            else {
                rolesArray = roles;
            }
            // Verificar permisos para cada rol del usuario
            let tienePermiso = false;
            for (const roleName of rolesArray) {
                const role = yield RoleRepository_1.RoleRepository.findByName(roleName);
                if (role) {
                    const permiso = yield PermisoRepository_1.PermisoRepository.checkPermission(role.role_id, recurso, accion);
                    if (permiso) {
                        tienePermiso = true;
                        break;
                    }
                }
            }
            if (!tienePermiso) {
                throw new AppError_1.ForbiddenError(`No tienes permiso para ${accion} en ${recurso}`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.checkPermission = checkPermission;
// Middleware para verificar si es admin
const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError_1.UnauthorizedError("Usuario no autenticado");
        }
        if (!req.user.roles.includes("admin")) {
            throw new AppError_1.ForbiddenError("Solo administradores pueden realizar esta acción");
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.isAdmin = isAdmin;
// Middleware para verificar si puede crear usuarios (solo admin)
exports.canCreateUser = exports.isAdmin;
//# sourceMappingURL=acl.js.map