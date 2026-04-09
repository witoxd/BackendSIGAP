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
exports.AdministrativoController = void 0;
const AdministrativoRepository_1 = require("../models/Repository/AdministrativoRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const persona_service_1 = require("../services/persona.service");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
class AdministrativoController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const limit = Number.parseInt(req.query.limit) || 50;
            const offset = Number.parseInt(req.query.offset) || 0;
            const administrativos = yield AdministrativoRepository_1.AdministrativoRepository.findAll(limit, offset);
            const total = yield AdministrativoRepository_1.AdministrativoRepository.count();
            res.status(200).json({
                success: true,
                data: administrativos,
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
            const administrativo = yield AdministrativoRepository_1.AdministrativoRepository.findById(id);
            if (!administrativo) {
                throw new AppError_1.AppError("Administrativo no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: administrativo,
            });
        }));
        this.SearchIndex = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const limit = Number.parseInt(req.query.limit) || 50;
            const index = req.params.index;
            if (!index) {
                throw new AppError_1.AppError("Parámetro index requerido", 400);
            }
            const administrativo = yield AdministrativoRepository_1.AdministrativoRepository.SearchIndex(index, limit);
            if (!administrativo || administrativo.length === 0) {
                throw new AppError_1.AppError("Administrativo no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: administrativo,
                pagination: {
                    total: administrativo.length,
                    limit,
                    pages: Math.ceil(administrativo.length / limit),
                },
            });
        }));
        this.create = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { persona: PersonaData, administrativo: AdministrativoData } = req.body;
            const { newPersona, NewAdministrativo } = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                const newPersona = yield persona_service_1.PersonaService.validateOrCreatePersona(PersonaData, client);
                const existingAdministrativo = yield AdministrativoRepository_1.AdministrativoRepository.findByPersonaId(newPersona.permiso_id);
                if (existingAdministrativo) {
                    throw new AppError_1.AppError("La persona ya tiene rol administrativo", 409);
                }
                const NewAdministrativo = yield AdministrativoRepository_1.AdministrativoRepository.create(Object.assign(Object.assign({}, AdministrativoData), { persona_id: newPersona.persona_id }), client);
                return { newPersona, NewAdministrativo };
            }));
            res.status(201).json({
                success: true,
                data: {
                    persona: newPersona,
                    administrador: NewAdministrativo
                },
                message: "Administrativo creado exitosamente",
            });
        }));
        this.update = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const Administrativoid = Number(req.params.id);
            const existingAdministrativo = yield AdministrativoRepository_1.AdministrativoRepository.findById(Administrativoid);
            if (!existingAdministrativo) {
                throw new AppError_1.AppError("Administrador no encontrado", 404);
            }
            const { persona: PersonaData, administrativo: AdministradorData } = req.body;
            const updateAdministrador = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                // Si llega persona, actualizar persona
                if (PersonaData) {
                    // Validar documento único
                    if (PersonaData.numero_documento) {
                        const personaConflicto = yield PersonaRepository_1.PersonaRepository.findByDocumento(PersonaData.numero_documento);
                        if (personaConflicto && personaConflicto.persona_id !== existingAdministrativo.persona_id) {
                            throw new AppError_1.AppError("Ya existe otra persona con ese documento", 409);
                        }
                    }
                    yield PersonaRepository_1.PersonaRepository.update(existingAdministrativo.persona_id, PersonaData, client);
                }
                let AdministrativoUpdate = null;
                if (AdministradorData && Object.keys(AdministradorData).length > 0) {
                    AdministrativoUpdate = yield AdministrativoRepository_1.AdministrativoRepository.update(Administrativoid, AdministradorData, client);
                }
                else {
                    AdministrativoUpdate = yield AdministrativoRepository_1.AdministrativoRepository.findById(Administrativoid);
                }
                return AdministrativoUpdate;
            }));
            const updatePersona = yield PersonaRepository_1.PersonaRepository.findById(existingAdministrativo.persona_id);
            res.status(200).json({
                success: true,
                data: {
                    persona: updatePersona,
                    admisnitrador: updateAdministrador,
                },
                message: "Administrativo actualizado exitosamente",
            });
        }));
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const administrativo = yield AdministrativoRepository_1.AdministrativoRepository.delete(id);
            if (!administrativo) {
                throw new AppError_1.AppError("Administrativo no encontrado", 404);
            }
            const persona = yield PersonaRepository_1.PersonaRepository.delete(administrativo.persona_id);
            res.status(200).json({
                success: true,
                data: {
                    administrativo: administrativo,
                    persona: persona
                },
                message: "Administrativo eliminado exitosamente",
            });
        }));
    }
}
exports.AdministrativoController = AdministrativoController;
//# sourceMappingURL=administrativo.controller.js.map