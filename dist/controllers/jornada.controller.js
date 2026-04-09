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
exports.JornadaController = void 0;
const JornadaRepository_1 = require("../models/Repository/JornadaRepository");
const AppError_1 = require("../utils/AppError");
const asyncHandler_1 = require("../utils/asyncHandler");
class JornadaController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const jornadas = yield JornadaRepository_1.JornadaRepository.findAll();
            res.status(200).json({
                success: true,
                data: jornadas,
            });
        }));
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const jornada = yield JornadaRepository_1.JornadaRepository.findById(id);
            if (!jornada) {
                throw new AppError_1.AppError("Jornada no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: jornada,
            });
        }));
        this.create = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { jornada: Jornada } = req.body;
            const jornada = yield JornadaRepository_1.JornadaRepository.create(Jornada);
            res.status(201).json({
                success: true,
                message: "Jornada creada exitosamente",
                data: jornada,
            });
        }));
        this.update = ((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const { jornada: updateJornada } = req.body;
            const jornada = yield JornadaRepository_1.JornadaRepository.update(id, updateJornada);
            if (!jornada) {
                throw new AppError_1.AppError("Jornada no encontrada o sin cambios", 404);
            }
            res.status(200).json({
                success: true,
                message: "Jornada actualizada exitosamente",
                data: jornada,
            });
        }));
        this.delete = ((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const jornada = yield JornadaRepository_1.JornadaRepository.delete(id);
            if (!jornada) {
                throw new AppError_1.AppError("Jornada no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                message: "Jornada eliminada exitosamente",
            });
        }));
    }
}
exports.JornadaController = JornadaController;
//# sourceMappingURL=jornada.controller.js.map