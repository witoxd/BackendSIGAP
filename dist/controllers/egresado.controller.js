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
exports.EgresadoController = void 0;
const EgresadoRepository_1 = require("../models/Repository/EgresadoRepository");
const AppError_1 = require("../utils/AppError");
const validators_1 = require("../utils/validators");
const EstudianteRepository_1 = require("../models/Repository/EstudianteRepository");
const asyncHandler_1 = require("../utils/asyncHandler");
class EgresadoController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit } = req.query;
            const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
            const egresados = yield EgresadoRepository_1.EgresadoRepository.findAll(pLimit, offset);
            const total = yield EgresadoRepository_1.EgresadoRepository.count();
            res.status(200).json({
                success: true,
                data: egresados,
                pagination: {
                    page: Math.floor(offset / pLimit) + 1,
                    limit: pLimit,
                    total,
                    pages: Math.ceil(total / pLimit),
                },
            });
        }));
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const egresado = yield EgresadoRepository_1.EgresadoRepository.findById(id);
            if (!egresado) {
                throw new AppError_1.AppError("Egresado no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: egresado,
            });
        }));
        this.getByEstudianteId = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const estudianteId = Number(req.params.estudianteId);
            const egresado = yield EgresadoRepository_1.EgresadoRepository.findByEstudianteId(estudianteId);
            if (!egresado) {
                throw new AppError_1.AppError("Egresado no encontrado para este estudiante", 404);
            }
            res.status(200).json({
                success: true,
                data: egresado,
            });
        }));
        this.getByYear = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const year = Number(req.params.year);
            const egresados = yield EgresadoRepository_1.EgresadoRepository.findByYear(year);
            res.status(200).json({
                success: true,
                data: egresados,
            });
        }));
        this.create = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { egresado: EgresadoData } = req.body;
            const existingEstudiante = yield EstudianteRepository_1.EstudianteRepository.findById(EgresadoData.estudiante_id);
            if (!existingEstudiante) {
                throw new AppError_1.AppError("Error al intentar egresar al estudiante", 404);
            }
            const existingEgresado = yield EgresadoRepository_1.EgresadoRepository.findByEstudianteId(EgresadoData.estudiante_id);
            if (existingEgresado) {
                throw new AppError_1.AppError("Ya el estudiante se graduo", 409);
            }
            const egresado = yield EgresadoRepository_1.EgresadoRepository.create(EgresadoData);
            res.status(201).json({
                success: true,
                message: "Egresado creado exitosamente",
                data: egresado,
            });
        }));
        this.update = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const { egresado: EgresadoData } = req.body;
            const egresado = yield EgresadoRepository_1.EgresadoRepository.update(id, EgresadoData);
            if (!egresado) {
                throw new AppError_1.AppError("Egresado no encontrado o sin cambios", 404);
            }
            res.status(200).json({
                success: true,
                message: "Egresado actualizado exitosamente",
                data: egresado,
            });
        }));
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const egresado = yield EgresadoRepository_1.EgresadoRepository.delete(id);
            if (!egresado) {
                throw new AppError_1.AppError("Egresado no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                message: "Egresado eliminado exitosamente",
            });
        }));
    }
}
exports.EgresadoController = EgresadoController;
//# sourceMappingURL=egresado.controller.js.map