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
exports.AcudienteController = void 0;
const AcudienteRepository_1 = require("../models/Repository/AcudienteRepository");
const AppError_1 = require("../utils/AppError");
const validators_1 = require("../utils/validators");
const database_1 = require("../config/database");
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const express_validator_1 = require("express-validator");
const persona_service_1 = require("../services/persona.service");
class AcudienteController {
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit } = req.query;
                const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
                const acudientes = yield AcudienteRepository_1.AcudienteRepository.findAll(pLimit, offset);
                res.status(200).json({
                    success: true,
                    data: acudientes,
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
                const acudiente = yield AcudienteRepository_1.AcudienteRepository.findById(id);
                if (!acudiente) {
                    throw new AppError_1.AppError("Acudiente no encontrado", 404);
                }
                res.status(200).json({
                    success: true,
                    data: acudiente
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getByEstudiante(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const estudianteId = Number(req.params.id);
                const acudientes = yield AcudienteRepository_1.AcudienteRepository.findByEstudiante(estudianteId);
                res.status(200).json({
                    success: true,
                    data: acudientes,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { acudiente: AcudienteData, persona: PersonaData } = req.body;
            try {
                const { NewAcudiente, NewPersona } = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                    const NewPersona = yield persona_service_1.PersonaService.validateOrCreatePersona(PersonaData, client);
                    const existingAcudiente = yield AcudienteRepository_1.AcudienteRepository.findByPersonaId(NewPersona.persona_id);
                    if (existingAcudiente) {
                        throw new AppError_1.AppError("La persona ya tiene rol de acudiente", 409);
                    }
                    console.log(AcudienteData);
                    const NewAcudiente = yield AcudienteRepository_1.AcudienteRepository.create(Object.assign(Object.assign({}, AcudienteData), { persona_id: NewPersona.persona_id }), client);
                    return { NewAcudiente, NewPersona };
                }));
                res.status(201).json({
                    success: true,
                    message: "Acudiente creado exitosamente",
                    data: {
                        acudiente: NewAcudiente,
                        persona: NewPersona
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            try {
                const AcudienteId = Number(req.params.id);
                const { acudiente: AcudienteData, persona: PersonaData } = req.body;
                const existingAcudiente = yield AcudienteRepository_1.AcudienteRepository.findById(AcudienteId);
                if (!existingAcudiente) {
                    throw new AppError_1.AppError("No existe un acudiente a actualizar", 404);
                }
                const AcudienteUpdate = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                    if (PersonaData) {
                        // Validar documento único
                        if (PersonaData.numero_documento) {
                            const personaConflicto = yield PersonaRepository_1.PersonaRepository.findByDocumento(PersonaData.numero_documento);
                            if (personaConflicto && personaConflicto.persona_id !== existingAcudiente.persona_id) {
                                throw new AppError_1.AppError("Ya existe otra persona con ese documento", 409);
                            }
                        }
                        yield PersonaRepository_1.PersonaRepository.update(existingAcudiente.persona_id, PersonaData, client);
                    }
                    let AcudienteUpdate = null;
                    if (AcudienteData && Object.keys(AcudienteData).length > 0) {
                        AcudienteUpdate = yield AcudienteRepository_1.AcudienteRepository.update(AcudienteId, AcudienteData);
                    }
                    else {
                        AcudienteUpdate = yield AcudienteRepository_1.AcudienteRepository.findById(AcudienteId);
                    }
                    return AcudienteUpdate;
                }));
                const updatePersona = yield PersonaRepository_1.PersonaRepository.findById(existingAcudiente.persona_id);
                res.status(200).json({
                    success: true,
                    message: "Acudiente actualizado exitosamente",
                    data: {
                        acudiente: AcudienteUpdate,
                        persona: updatePersona
                    },
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
                const acudiente = yield AcudienteRepository_1.AcudienteRepository.delete(id);
                if (!acudiente) {
                    throw new AppError_1.AppError("Acudiente no encontrado", 404);
                }
                const persona = yield PersonaRepository_1.PersonaRepository.delete(acudiente.persona_id);
                res.status(200).json({
                    success: true,
                    message: "Acudiente eliminado exitosamente",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    assignToEstudiante(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { assignToEstudiante: AcudienteAssingEstudiante } = req.body;
            try {
                const result = yield AcudienteRepository_1.AcudienteRepository.assignToEstudiante(AcudienteAssingEstudiante);
                res.status(200).json({
                    success: true,
                    message: "Acudiente asignado al estudiante exitosamente",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    removeFromEstudiante(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const estudianteId = Number(req.params.estudianteId);
                const acudienteId = Number(req.params.acudienteId);
                const result = yield AcudienteRepository_1.AcudienteRepository.removeFromEstudiante(estudianteId, acudienteId);
                if (!result) {
                    throw new AppError_1.AppError("Relación no encontrada", 404);
                }
                res.status(200).json({
                    success: true,
                    message: "Acudiente removido del estudiante exitosamente",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AcudienteController = AcudienteController;
//# sourceMappingURL=acudiente.controller.js.map