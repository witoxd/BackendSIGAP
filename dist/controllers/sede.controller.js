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
exports.SedeController = void 0;
const SedeRepository_1 = require("../models/Repository/SedeRepository");
const AppError_1 = require("../utils/AppError");
const validators_1 = require("../utils/validators");
class SedeController {
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit } = req.query;
                const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
                const sedes = yield SedeRepository_1.SedeRepository.findAll(pLimit, offset);
                const total = yield SedeRepository_1.SedeRepository.count();
                res.status(200).json({
                    success: true,
                    data: sedes,
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
                const id = Number.parseInt(req.params.id);
                const sede = yield SedeRepository_1.SedeRepository.findById(id);
                if (!sede) {
                    throw new AppError_1.AppError("Sede no encontrada", 404);
                }
                res.status(200).json({
                    success: true,
                    data: sede,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    search(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, page, limit } = req.query;
                const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
                const sedes = nombre ? yield SedeRepository_1.SedeRepository.findByNombre(nombre) : yield SedeRepository_1.SedeRepository.findAll(pLimit, offset);
                res.status(200).json({
                    success: true,
                    data: sedes,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sede: SedeData } = req.body;
            try {
                const sede = yield SedeRepository_1.SedeRepository.create(SedeData);
                if (!sede) {
                    throw new AppError_1.AppError("Error al crear sede", 403);
                }
                res.status(201).json({
                    success: true,
                    message: "Sede creada exitosamente",
                    data: sede,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const { sede: SedeData } = req.body;
                const sede = yield SedeRepository_1.SedeRepository.update(id, SedeData);
                if (!sede) {
                    throw new AppError_1.AppError("Sede no encontrada o sin cambios", 404);
                }
                res.status(200).json({
                    success: true,
                    message: "Sede actualizada exitosamente",
                    data: sede,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const sede = yield SedeRepository_1.SedeRepository.delete(id);
                if (!sede) {
                    throw new AppError_1.AppError("Sede no encontrada", 404);
                }
                res.status(200).json({
                    success: true,
                    message: "Sede eliminada exitosamente",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.SedeController = SedeController;
//# sourceMappingURL=sede.controller.js.map