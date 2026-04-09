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
exports.EstudianteController = void 0;
const EstudianteRepository_1 = require("../models/Repository/EstudianteRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
class EstudianteController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const limit = Number.parseInt(req.query.limit) || 50;
            const offset = Number.parseInt(req.query.offset) || 0;
            const estudiantes = yield EstudianteRepository_1.EstudianteRepository.findAll(limit, offset);
            const total = yield EstudianteRepository_1.EstudianteRepository.count();
            res.status(200).json({
                success: true,
                data: estudiantes,
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
            const estudiante = yield EstudianteRepository_1.EstudianteRepository.findById(id);
            if (!estudiante) {
                throw new AppError_1.AppError("Estudiante no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: estudiante,
            });
        }));
        this.getByDocumento = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { numero_documento } = req.params;
            const estudiante = yield EstudianteRepository_1.EstudianteRepository.findByDocumento(numero_documento);
            if (!estudiante) {
                throw new AppError_1.AppError("Estudiante no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: estudiante,
            });
        }));
        this.SearchIndex = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const limit = Number.parseInt(req.query.limit) || 50;
            const index = req.params.index;
            if (!index) {
                throw new AppError_1.AppError("Parámetro index requerido", 400);
            }
            const estudiantes = yield EstudianteRepository_1.EstudianteRepository.SearchIndex(index, limit);
            res.status(200).json({
                success: true,
                data: estudiantes,
                pagination: {
                    total: estudiantes.length,
                    limit,
                    pages: Math.ceil(estudiantes.length / limit),
                },
            });
        }));
        this.create = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { persona: PersonaData, estudiante: estudianteData } = req.body;
            // Validar que no exista documento
            const existingPersona = yield PersonaRepository_1.PersonaRepository.findByDocumento(PersonaData.numero_documento);
            if (existingPersona) {
                throw new AppError_1.AppError("Ya existe una persona con ese documento", 409);
            }
            const { newPersona, newEstudiante } = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                // Crear persona primero
                const newPersona = yield PersonaRepository_1.PersonaRepository.create(PersonaData, client);
                // Crear estudiante usando persona_id recién creado
                const newEstudiante = yield EstudianteRepository_1.EstudianteRepository.create(Object.assign(Object.assign({}, estudianteData), { persona_id: newPersona.persona_id }), client);
                return { newEstudiante, newPersona };
            }));
            // Respuesta
            return res.status(201).json({
                success: true,
                message: "Estudiante creado exitosamente",
                data: {
                    persona: newPersona,
                    estudiante: newEstudiante,
                },
            });
        }));
        this.update = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const estudianteId = Number(req.params.id);
            // Buscar estudiante existente
            const existing = yield EstudianteRepository_1.EstudianteRepository.findById(estudianteId);
            if (!existing) {
                throw new AppError_1.AppError("Estudiante no encontrado", 404);
            }
            const { persona: personaData, estudiante: estudianteData } = req.body;
            const updatedEstudiante = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                // Si llega persona, actualizar persona
                if (personaData) {
                    // Validar documento único
                    if (personaData.numero_documento) {
                        const personaConflicto = yield PersonaRepository_1.PersonaRepository.findByDocumento(personaData.numero_documento);
                        if (personaConflicto && personaConflicto.persona_id !== existing.persona_id) {
                            throw new AppError_1.AppError("Ya existe otra persona con ese documento", 409);
                        }
                    }
                    yield PersonaRepository_1.PersonaRepository.update(existing.persona.persona_id, personaData, client);
                }
                // Si llegan datos del estudiante, actualizarlos
                let updatedEstudiante = null;
                if (estudianteData && Object.keys(estudianteData).length > 0) {
                    updatedEstudiante = yield EstudianteRepository_1.EstudianteRepository.update(estudianteId, estudianteData, client);
                }
                else {
                    updatedEstudiante = yield EstudianteRepository_1.EstudianteRepository.findById(estudianteId);
                }
                return updatedEstudiante;
            }));
            // Obtener persona actualizada
            const updatedPersona = yield PersonaRepository_1.PersonaRepository.findById(existing.persona.persona_id);
            // Respuesta final unificada
            return res.status(200).json({
                success: true,
                message: "Estudiante actualizado exitosamente",
                data: {
                    persona: updatedPersona,
                    estudiante: updatedEstudiante,
                },
            });
        }));
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const estudiante = yield EstudianteRepository_1.EstudianteRepository.delete(id);
            if (!estudiante) {
                throw new AppError_1.AppError("Estudiante no encontrado", 404);
            }
            const persona = yield PersonaRepository_1.PersonaRepository.delete(estudiante.persona_id);
            res.status(200).json({
                success: true,
                data: {
                    estudiante: estudiante,
                    persona: persona
                },
                message: "Estudiante eliminado exitosamente",
            });
        }));
        this.getEstudiantesByAcudiente = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const acudienteId = Number(req.params.id);
            const estudiantes = yield EstudianteRepository_1.EstudianteRepository.getEstudiantesByAcudiente(acudienteId);
            res.status(200).json({
                success: true,
                data: estudiantes,
            });
        }));
    }
}
exports.EstudianteController = EstudianteController;
//# sourceMappingURL=estudiante.controller.js.map