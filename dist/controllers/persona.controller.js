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
exports.PersonaController = void 0;
// src/services/persona.service.ts
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
const asyncHandler_1 = require("../utils/asyncHandler");
class PersonaController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const limit = Number.parseInt(req.query.limit) || 50;
            const offset = Number.parseInt(req.query.offset) || 0;
            const personas = yield PersonaRepository_1.PersonaRepository.findAll(limit, offset);
            const total = yield PersonaRepository_1.PersonaRepository.count();
            res.status(200).json({
                success: true,
                data: personas,
                pagination: {
                    total,
                    limit,
                    offset,
                    pages: Math.ceil(total / limit),
                },
            });
        }));
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const persona = yield PersonaRepository_1.PersonaRepository.findById(Number(id));
            if (!persona) {
                throw new AppError_1.AppError("Persona no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: persona,
            });
        }));
        this.getByDocumento = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { numero_documento } = req.params;
            const persona = yield PersonaRepository_1.PersonaRepository.findByDocumento(numero_documento);
            if (!persona) {
                throw new AppError_1.AppError("Persona no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: persona,
            });
        }));
        this.searchByDocumento = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { numero_documento } = req.params;
            const persona = yield PersonaRepository_1.PersonaRepository.findByDocumento(numero_documento);
            if (!persona) {
                throw new AppError_1.AppError("Persona no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: persona,
            });
        }));
        this.SearchIndex = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const index = req.params.index;
            if (!index) {
                throw new AppError_1.AppError("Parámetro index requerido", 400);
            }
            const persona = yield PersonaRepository_1.PersonaRepository.SearchIndex(index);
            if (!persona) {
                throw new AppError_1.AppError("Persona no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: persona,
            });
        }));
        //   createPersona = asyncHandler(async (data: Omit<PersonaCreationAttributes, "persona_id">) => {
        //   const existingPersona = await PersonaRepository.findByDocumento(data.numero_documento)
        //   if (existingPersona) {
        //     throw new AppError("Ya existe una persona con ese número de documento", 409)
        //   }
        //   const persona = await PersonaRepository.create(data)
        //   return persona
        // })
        this.create = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { persona: PersonaData } = req.body;
            const existingPersona = yield PersonaRepository_1.PersonaRepository.findByDocumento(PersonaData.numero_documento);
            if (existingPersona) {
                throw new AppError_1.AppError("Ya existe una persona con ese número de documento", 409);
            }
            const persona = yield PersonaRepository_1.PersonaRepository.create(PersonaData);
            res.status(201).json({
                success: true,
                data: persona,
                message: "Persona creada exitosamente",
            });
        }));
        this.update = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const id = Number(req.params.id);
            const { persona: PersonaData } = req.body;
            if (PersonaData.numero_documento) {
                const existingPersona = yield PersonaRepository_1.PersonaRepository.findByDocumento(PersonaData.numero_documento);
                if (existingPersona.persona.persona_id !== id) {
                    throw new AppError_1.AppError("Ya existe otra persona con ese número de documento", 409);
                }
            }
            const persona = yield PersonaRepository_1.PersonaRepository.update(id, PersonaData);
            if (!persona) {
                throw new AppError_1.AppError("Persona no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: persona,
                message: "Persona actualizada exitosamente",
            });
        }));
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const persona = yield PersonaRepository_1.PersonaRepository.delete(Number(id));
            if (!persona) {
                throw new AppError_1.AppError("Persona no encontrada", 404);
            }
            res.status(200).json({
                success: true,
                data: persona,
                message: "Persona eliminada exitosamente",
            });
        }));
    }
}
exports.PersonaController = PersonaController;
//# sourceMappingURL=persona.controller.js.map