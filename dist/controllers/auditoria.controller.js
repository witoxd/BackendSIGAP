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
exports.AuditoriaController = void 0;
const AuditoriaRepository_1 = require("../models/Repository/AuditoriaRepository");
const AppError_1 = require("../utils/AppError");
const validators_1 = require("../utils/validators");
class AuditoriaController {
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit } = req.query;
                const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
                const auditorias = yield AuditoriaRepository_1.AuditoriaRepository.findAll(pLimit, offset);
                const total = yield AuditoriaRepository_1.AuditoriaRepository.count();
                res.status(200).json({
                    success: true,
                    data: auditorias,
                    pagination: {
                        page: Math.floor(offset / pLimit) + 1,
                        limit: pLimit,
                        total,
                        pages: Math.ceil(total / pLimit),
                    },
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
                const auditoria = yield AuditoriaRepository_1.AuditoriaRepository.findById(id);
                if (!auditoria) {
                    throw new AppError_1.AppError("Registro de auditoría no encontrado", 404);
                }
                res.status(200).json({
                    success: true,
                    data: auditoria,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getByUsuarioId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario_id, page, limit } = req.query;
                const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
                if (!usuario_id) {
                    throw new AppError_1.AppError("El usuario_id es requerido", 400);
                }
                const auditorias = yield AuditoriaRepository_1.AuditoriaRepository.findByUsuarioId(Number.parseInt(usuario_id), pLimit, offset);
                res.status(200).json({
                    success: true,
                    data: auditorias,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getByAccion(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { accion, page, limit } = req.query;
                const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
                if (!accion) {
                    throw new AppError_1.AppError("La acción es requerida", 400);
                }
                const auditorias = yield AuditoriaRepository_1.AuditoriaRepository.findByAccion(accion, pLimit, offset);
                res.status(200).json({
                    success: true,
                    data: auditorias,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getByTabla(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tabla, page, limit } = req.query;
                const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
                if (!tabla) {
                    throw new AppError_1.AppError("La tabla es requerida", 400);
                }
                const auditorias = yield AuditoriaRepository_1.AuditoriaRepository.findByTabla(tabla, pLimit, offset);
                res.status(200).json({
                    success: true,
                    data: auditorias,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuditoriaController = AuditoriaController;
//# sourceMappingURL=auditoria.controller.js.map