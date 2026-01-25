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
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleByName = exports.getRoleById = exports.getAllRoles = void 0;
const RoleRepository_1 = require("../models/Repository/RoleRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
const getAllRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield RoleRepository_1.RoleRepository.findAll();
    res.status(200).json({
        success: true,
        data: roles,
    });
});
exports.getAllRoles = getAllRoles;
const getRoleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const role = yield RoleRepository_1.RoleRepository.findById(Number.parseInt(id));
    if (!role) {
        throw new AppError_1.AppError("Rol no encontrado", 404);
    }
    res.status(200).json({
        success: true,
        data: role,
    });
});
exports.getRoleById = getRoleById;
const getRoleByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre } = req.params;
    const role = yield RoleRepository_1.RoleRepository.findByName(nombre);
    if (!role) {
        throw new AppError_1.AppError("Rol no encontrado", 404);
    }
    res.status(200).json({
        success: true,
        data: role,
    });
});
exports.getRoleByName = getRoleByName;
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new AppError_1.AppError("Errores de validación", 400, errors.array());
    }
    const existingRole = yield RoleRepository_1.RoleRepository.findByName(req.body.nombre);
    if (existingRole) {
        throw new AppError_1.AppError("Ya existe un rol con ese nombre", 409);
    }
    const role = yield RoleRepository_1.RoleRepository.create(req.body);
    res.status(201).json({
        success: true,
        data: role,
        message: "Rol creado exitosamente",
    });
});
exports.createRole = createRole;
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new AppError_1.AppError("Errores de validación", 400, errors.array());
    }
    const { id } = req.params;
    if (req.body.nombre) {
        const existingRole = yield RoleRepository_1.RoleRepository.findByName(req.body.nombre);
        if (existingRole && existingRole.role_id !== Number.parseInt(id)) {
            throw new AppError_1.AppError("Ya existe otro rol con ese nombre", 409);
        }
    }
    const role = yield RoleRepository_1.RoleRepository.update(Number.parseInt(id), req.body);
    if (!role) {
        throw new AppError_1.AppError("Rol no encontrado", 404);
    }
    res.status(200).json({
        success: true,
        data: role,
        message: "Rol actualizado exitosamente",
    });
});
exports.updateRole = updateRole;
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const role = yield RoleRepository_1.RoleRepository.delete(Number.parseInt(id));
    if (!role) {
        throw new AppError_1.AppError("Rol no encontrado", 404);
    }
    res.status(200).json({
        success: true,
        data: role,
        message: "Rol eliminado exitosamente",
    });
});
exports.deleteRole = deleteRole;
//# sourceMappingURL=role.controller.js.map