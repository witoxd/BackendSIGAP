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
exports.ProfesorController = void 0;
const ProfesorRepository_1 = require("../models/Repository/ProfesorRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const database_1 = require("../config/database");
const persona_service_1 = require("../services/persona.service");
class ProfesorController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = Number.parseInt(req.query.limit) || 50;
            const offset = Number.parseInt(req.query.offset) || 0;
            const profesores = yield ProfesorRepository_1.ProfesorRepository.findAll(limit, offset);
            const total = yield ProfesorRepository_1.ProfesorRepository.count();
            res.status(200).json({
                success: true,
                data: profesores,
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
            const profesor = yield ProfesorRepository_1.ProfesorRepository.findById(Number(id));
            if (!profesor) {
                throw new AppError_1.AppError("Profesor no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: profesor,
            });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { persona: PersonaData, profesor: ProfesorData } = req.body;
            const { newPersona, newProfesor } = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                const newPersona = yield persona_service_1.PersonaService.validateOrCreatePersona(PersonaData, client);
                const existingProfesor = yield ProfesorRepository_1.ProfesorRepository.findByPersonaId(newPersona.persona_id);
                if (existingProfesor) {
                    throw new AppError_1.AppError("Ya la persona es profesor", 404);
                }
                const newProfesor = yield ProfesorRepository_1.ProfesorRepository.create(Object.assign(Object.assign({}, ProfesorData), { persona_id: newPersona.persona_id }), client);
                return { newPersona, newProfesor };
            }));
            res.status(201).json({
                success: true,
                data: {
                    persona: newPersona,
                    profesor: newProfesor
                },
                message: "Profesor creado exitosamente",
            });
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const ProfesorId = Number(req.params.id);
            const existingProfesor = yield ProfesorRepository_1.ProfesorRepository.findById(ProfesorId);
            if (!existingProfesor) {
                throw new AppError_1.AppError("No existe este profesor", 404);
            }
            const { persona: PersonaData, profesor: profesorData } = req.body;
            const updateProfesor = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                if (PersonaData) {
                    // Validar documento único
                    if (PersonaData.numero_documento) {
                        const personaConflicto = yield PersonaRepository_1.PersonaRepository.findByDocumento(PersonaData.numero_documento);
                        if (personaConflicto && personaConflicto.persona_id !== existingProfesor.persona_id) {
                            throw new AppError_1.AppError("Ya existe otra persona con ese documento", 409);
                        }
                    }
                    yield PersonaRepository_1.PersonaRepository.update(existingProfesor.persona_id, PersonaData, client);
                }
                let updateProfesor = null;
                if (PersonaData) {
                    updateProfesor = yield ProfesorRepository_1.ProfesorRepository.update(ProfesorId, profesorData, client);
                }
                else {
                    updateProfesor = yield ProfesorRepository_1.ProfesorRepository.findById(ProfesorId);
                }
                return updateProfesor;
            }));
            const updatePersona = yield PersonaRepository_1.PersonaRepository.findById(updateProfesor.persona_id);
            res.status(200).json({
                success: true,
                data: {
                    persona: updatePersona,
                    Profesor: updateProfesor
                },
                message: "Profesor actualizado exitosamente",
            });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params);
            const profesor = yield ProfesorRepository_1.ProfesorRepository.delete(id);
            if (!profesor) {
                throw new AppError_1.AppError("Profesor no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: profesor,
                message: "Profesor eliminado exitosamente",
            });
        });
    }
}
exports.ProfesorController = ProfesorController;
//# sourceMappingURL=profesor.controller.js.map