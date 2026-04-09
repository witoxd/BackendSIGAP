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
exports.CursoController = void 0;
const CursoRepository_1 = require("../models/Repository/CursoRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
const asyncHandler_1 = require("../utils/asyncHandler");
class CursoController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const limit = Number.parseInt(req.query.limit) || 50;
            const offset = Number.parseInt(req.query.offset) || 0;
            const cursos = yield CursoRepository_1.CursoRepository.findAll(limit, offset);
            const total = yield CursoRepository_1.CursoRepository.count();
            res.status(200).json({
                success: true,
                data: cursos,
                pagination: {
                    total,
                    limit,
                    offset,
                    pages: Math.ceil(total / limit),
                },
            });
        }));
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const curso = yield CursoRepository_1.CursoRepository.findById(id);
            if (!curso) {
                throw new AppError_1.AppError("Curso no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: curso,
            });
        }));
        //  async getByProfesor (req: Request, res: Response) {
        //   const profesor_id = Number(req.params.id)
        //   const cursos = await CursoRepository.findByProfesor(profesor_id)
        //   res.status(200).json({
        //     success: true,
        //     data: cursos,
        //   })
        // }
        this.create = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { curso: CursoData } = req.body;
            const curso = yield CursoRepository_1.CursoRepository.create(CursoData);
            res.status(201).json({
                success: true,
                data: curso,
                message: "Curso creado exitosamente",
            });
        }));
        this.update = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const id = Number(req.params.id);
            const { curso: CursoData } = req.body;
            const curso = yield CursoRepository_1.CursoRepository.update(id, CursoData);
            if (!curso) {
                throw new AppError_1.AppError("Curso no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: curso,
                message: "Curso actualizado exitosamente",
            });
        }));
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const curso = yield CursoRepository_1.CursoRepository.delete(id);
            if (!curso) {
                throw new AppError_1.AppError("Curso no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: curso,
                message: "Curso eliminado exitosamente",
            });
        }));
    }
}
exports.CursoController = CursoController;
//# sourceMappingURL=curso.controller.js.map