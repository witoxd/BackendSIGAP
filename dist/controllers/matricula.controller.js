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
exports.MatriculaController = void 0;
const MatriculaRepository_1 = require("../models/Repository/MatriculaRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
class MatriculaController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = Number.parseInt(req.query.limit) || 50;
            const offset = Number.parseInt(req.query.offset) || 0;
            const matriculas = yield MatriculaRepository_1.MatriculaRepository.findAll(limit, offset);
            const total = yield MatriculaRepository_1.MatriculaRepository.count();
            res.status(200).json({
                success: true,
                data: matriculas,
                pagination: {
                    total,
                    limit,
                    offset,
                    pages: Math.ceil(total / limit),
                },
            });
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const matricula = yield MatriculaRepository_1.MatriculaRepository.findById(Number(id));
            if (!matricula) {
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: matricula,
            });
        });
    }
    getByEstudiante(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const estudiante_id = Number(req.params);
            const matriculas = yield MatriculaRepository_1.MatriculaRepository.findByEstudiante(estudiante_id);
            res.status(200).json({
                success: true,
                data: matriculas,
            });
        });
    }
    getByCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const curso_id = Number(req.params);
            const matriculas = yield MatriculaRepository_1.MatriculaRepository.findByCurso(curso_id);
            res.status(200).json({
                success: true,
                data: matriculas,
            });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { matricula: matriculaData } = req.body;
            const existingMatricula = yield MatriculaRepository_1.MatriculaRepository.findByEstudianteAndCurso(matriculaData.estudiante_id, matriculaData.curso_id);
            if (existingMatricula) {
                throw new AppError_1.AppError("El estudiante ya está matriculado en este curso", 409);
            }
            const matricula = yield MatriculaRepository_1.MatriculaRepository.create(matriculaData);
            res.status(201).json({
                success: true,
                data: matricula,
                message: "Matrícula creada exitosamente",
            });
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const id = Number(req.params.id);
            const { matricula: matriculaData } = req.body;
            const matricula = yield MatriculaRepository_1.MatriculaRepository.update(id, matriculaData);
            if (!matricula) {
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: matricula,
                message: "Matrícula actualizada exitosamente",
            });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const matricula = yield MatriculaRepository_1.MatriculaRepository.delete(Number(id));
            if (!matricula) {
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: matricula,
                message: "Matrícula eliminada exitosamente",
            });
        });
    }
}
exports.MatriculaController = MatriculaController;
//# sourceMappingURL=matricula.controller.js.map