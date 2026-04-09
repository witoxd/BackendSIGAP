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
exports.ContactoController = void 0;
const ContactoRepository_1 = require("../models/Repository/ContactoRepository");
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const AppError_1 = require("../utils/AppError");
const validators_1 = require("../utils/validators");
const express_validator_1 = require("express-validator");
const asyncHandler_1 = require("../utils/asyncHandler");
class ContactoController {
    constructor() {
        /**
         * Obtener todos los contactos
         */
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit } = req.query;
            const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
            const contactos = yield ContactoRepository_1.ContactoRepository.findAll(pLimit, offset);
            const total = yield ContactoRepository_1.ContactoRepository.count();
            res.status(200).json({
                success: true,
                data: contactos,
                pagination: {
                    page: Math.floor(offset / pLimit) + 1,
                    limit: pLimit,
                    total,
                    pages: Math.ceil(total / pLimit),
                },
            });
        }));
        /**
         * Obtener contacto por ID
         */
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const contacto = yield ContactoRepository_1.ContactoRepository.findById(id);
            if (!contacto) {
                throw new AppError_1.AppError("Contacto no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: contacto,
            });
        }));
        /**
         * Obtener contactos por persona
         */
        this.getByPersonaId = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const personaId = Number(req.params.personaId);
            const contactos = yield ContactoRepository_1.ContactoRepository.findByPersonaId(personaId);
            res.status(200).json({
                success: true,
                data: contactos,
            });
        }));
        /**
         * Obtener contactos por tipo
         */
        this.getByTipo = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const personaId = Number(req.params.personaId);
            const { tipo } = req.query;
            if (!tipo) {
                throw new AppError_1.AppError("El tipo de contacto es requerido", 400);
            }
            const contactos = yield ContactoRepository_1.ContactoRepository.findByTipo(personaId, tipo);
            res.status(200).json({
                success: true,
                data: contactos,
            });
        }));
        /**
         * Crear un nuevo contacto
         */
        this.create = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { contacto: ContactoData } = req.body;
            // Verificar que la persona existe
            const existingPersona = yield PersonaRepository_1.PersonaRepository.findById(ContactoData.persona_id);
            if (!existingPersona) {
                throw new AppError_1.AppError("Persona no encontrada", 404);
            }
            // Si se marca como principal, quitar principal de otros contactos
            if (ContactoData.es_principal) {
                const contacto = yield ContactoRepository_1.ContactoRepository.create(ContactoData);
                yield ContactoRepository_1.ContactoRepository.setPrincipal(contacto.contacto_id, ContactoData.persona_id);
                res.status(201).json({
                    success: true,
                    message: "Contacto creado exitosamente",
                    data: contacto,
                });
            }
            else {
                const contacto = yield ContactoRepository_1.ContactoRepository.create(ContactoData);
                res.status(201).json({
                    success: true,
                    message: "Contacto creado exitosamente",
                    data: contacto,
                });
            }
        }));
        /**
         * Crear múltiples contactos
         */
        this.bulkCreate = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { contactos } = req.body;
            if (!Array.isArray(contactos) || contactos.length === 0) {
                throw new AppError_1.AppError("Se requiere un array de contactos", 400);
            }
            // Verificar que todas las personas existen
            const personaIds = [...new Set(contactos.map((c) => c.persona_id))];
            for (const personaId of personaIds) {
                const persona = yield PersonaRepository_1.PersonaRepository.findById(personaId);
                if (!persona) {
                    throw new AppError_1.AppError(`Persona con ID ${personaId} no encontrada`, 404);
                }
            }
            const nuevosContactos = yield ContactoRepository_1.ContactoRepository.bulkCreate(contactos);
            res.status(201).json({
                success: true,
                message: "Contactos creados exitosamente",
                total: nuevosContactos.length,
                data: nuevosContactos,
            });
        }));
        /**
         * Actualizar un contacto
         */
        this.update = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const id = Number(req.params.id);
            const { contacto: ContactoData } = req.body;
            const existingContacto = yield ContactoRepository_1.ContactoRepository.findById(id);
            if (!existingContacto) {
                throw new AppError_1.AppError("Contacto no encontrado", 404);
            }
            // Si se marca como principal, actualizar otros contactos
            if (ContactoData.es_principal) {
                yield ContactoRepository_1.ContactoRepository.setPrincipal(id, existingContacto.persona_id);
            }
            const contacto = yield ContactoRepository_1.ContactoRepository.update(id, ContactoData);
            if (!contacto) {
                throw new AppError_1.AppError("Contacto no encontrado o sin cambios", 404);
            }
            res.status(200).json({
                success: true,
                message: "Contacto actualizado exitosamente",
                data: contacto,
            });
        }));
        /**
         * Eliminar un contacto (soft delete)
         */
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const contacto = yield ContactoRepository_1.ContactoRepository.delete(id);
            if (!contacto) {
                throw new AppError_1.AppError("Contacto no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                message: "Contacto eliminado exitosamente",
            });
        }));
        /**
         * Establecer contacto como principal
         */
        this.setPrincipal = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const existingContacto = yield ContactoRepository_1.ContactoRepository.findById(id);
            if (!existingContacto) {
                throw new AppError_1.AppError("Contacto no encontrado", 404);
            }
            const contacto = yield ContactoRepository_1.ContactoRepository.setPrincipal(id, existingContacto.persona_id);
            res.status(200).json({
                success: true,
                message: "Contacto establecido como principal",
                data: contacto,
            });
        }));
    }
}
exports.ContactoController = ContactoController;
//# sourceMappingURL=contacto.controller.js.map