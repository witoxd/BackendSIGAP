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
exports.validateUpdateRoleDomain = exports.validateCreateRoleDomain = void 0;
const Role_1 = require("../../models/sequelize/Role");
const sequelize_1 = require("sequelize");
const validateCreateRoleDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = req.body;
        // Validacion dominio con Sequelize (NO DB)
        yield Role_1.Role.build(role).validate();
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
exports.validateCreateRoleDomain = validateCreateRoleDomain;
const validateUpdateRoleDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = req.body;
        yield Role_1.Role.build(role).validate();
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
exports.validateUpdateRoleDomain = validateUpdateRoleDomain;
//# sourceMappingURL=role.domain.js.map