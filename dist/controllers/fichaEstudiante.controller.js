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
exports.ExpedienteController = exports.ViviendaEstudianteController = exports.ColegioAnteriorController = exports.FichaEstudianteController = void 0;
const FichaEstudianteRepository_1 = require("../models/Repository/FichaEstudianteRepository");
const ColegioAnteriorRepository_1 = require("../models/Repository/ColegioAnteriorRepository");
const ViviendaEstudianteRepository_1 = require("../models/Repository/ViviendaEstudianteRepository");
const EstudianteRepository_1 = require("../models/Repository/EstudianteRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
function assertEstudianteExists(estudianteId) {
    return __awaiter(this, void 0, void 0, function* () {
        const estudiante = yield EstudianteRepository_1.EstudianteRepository.findById(estudianteId);
        if (!estudiante)
            throw new AppError_1.AppError("Estudiante no encontrado", 404);
        return estudiante;
    });
}
// =============================================================================
// FICHA ESTUDIANTE
// Datos de caracterización: familia, salud, transporte, información escolar.
// Patrón upsert: el formulario se puede llenar parcialmente y guardarse
// varias veces — como auto-guardado de un formulario web largo.
// =============================================================================
class FichaEstudianteController {
    constructor() {
        // GET /fichaEstudiante/:estudianteId
        this.getByEstudiante = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const estudianteId = Number(req.params.estudianteId);
            yield assertEstudianteExists(estudianteId);
            const ficha = yield FichaEstudianteRepository_1.FichaEstudianteRepository.findByEstudianteId(estudianteId);
            res.status(200).json({
                success: true,
                // null indica que la ficha aún no se ha llenado — el frontend
                // puede mostrar el formulario vacío en lugar de un error 404
                data: ficha !== null && ficha !== void 0 ? ficha : null,
            });
        }));
        // PUT /fichaEstudiante/:estudianteId
        // Upsert: crea si no existe, actualiza si ya existe
        this.upsert = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            try {
                const estudianteId = Number(req.params.estudianteId);
                yield assertEstudianteExists(estudianteId);
                const { ficha: fichaData } = req.body;
                const ficha = yield FichaEstudianteRepository_1.FichaEstudianteRepository.upsert(estudianteId, fichaData);
                res.status(200).json({
                    success: true,
                    message: "Ficha del estudiante guardada exitosamente",
                    data: ficha,
                });
            }
            catch (error) {
                next(error);
            }
        }));
        // DELETE /fichaEstudiante/:estudianteId
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const estudianteId = Number(req.params.estudianteId);
            yield assertEstudianteExists(estudianteId);
            const ficha = yield FichaEstudianteRepository_1.FichaEstudianteRepository.delete(estudianteId);
            if (!ficha) {
                throw new AppError_1.AppError("Ficha no encontrada para este estudiante", 404);
            }
            res.status(200).json({
                success: true,
                message: "Ficha del estudiante eliminada exitosamente",
            });
        }));
    }
}
exports.FichaEstudianteController = FichaEstudianteController;
// =============================================================================
// COLEGIOS ANTERIORES
// Lista de instituciones previas del estudiante.
// Tiene dos estrategias de escritura:
//   - create/update/delete: operaciones individuales
//   - replaceAll: reemplaza toda la lista de una vez (útil cuando el frontend
//     maneja la lista localmente y la manda completa al guardar)
// =============================================================================
class ColegioAnteriorController {
    constructor() {
        // GET /colegiosAnteriores/:estudianteId
        this.getByEstudiante = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const estudianteId = Number(req.params.estudianteId);
                yield assertEstudianteExists(estudianteId);
                const colegios = yield ColegioAnteriorRepository_1.ColegioAnteriorRepository.findByEstudianteId(estudianteId);
                res.status(200).json({
                    success: true,
                    data: colegios,
                });
            }
            catch (error) {
                next(error);
            }
        }));
        // POST /colegiosAnteriores/:estudianteId
        // Agrega un colegio individual a la lista
        this.create = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const estudianteId = Number(req.params.estudianteId);
            yield assertEstudianteExists(estudianteId);
            const { colegio: colegioData } = req.body;
            const colegio = yield ColegioAnteriorRepository_1.ColegioAnteriorRepository.create(Object.assign(Object.assign({}, colegioData), { estudiante_id: estudianteId }));
            res.status(201).json({
                success: true,
                message: "Colegio anterior registrado exitosamente",
                data: colegio,
            });
        }));
        // PUT /colegiosAnteriores/:estudianteId/replaceAll
        // Reemplaza TODA la lista del estudiante en una transacción atómica.
        // El frontend manda la lista completa tal como quedó tras la edición.
        // Analogía: como "Guardar como" — reemplaza el archivo completo en lugar
        // de parcharlo línea por línea.
        this.replaceAll = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            try {
                const estudianteId = Number(req.params.estudianteId);
                yield assertEstudianteExists(estudianteId);
                const { colegios } = req.body;
                // Transacción garantiza que si el INSERT falla, el DELETE anterior
                // se revierte y el estudiante no queda sin colegios
                const result = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                    return yield ColegioAnteriorRepository_1.ColegioAnteriorRepository.replaceAll(estudianteId, colegios, client);
                }));
                res.status(200).json({
                    success: true,
                    message: "Colegios anteriores actualizados exitosamente",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        }));
        // PATCH /colegiosAnteriores/:estudianteId/:colegioId
        // Actualiza un colegio individual sin afectar el resto
        this.update = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const colegioId = Number(req.params.colegioId);
            const estudianteId = Number(req.params.estudianteId);
            // Verificar que el colegio le pertenece al estudiante —
            // mismo patrón que removeFromEstudiante en acudiente.controller
            const existing = yield ColegioAnteriorRepository_1.ColegioAnteriorRepository.findById(colegioId);
            if (!existing) {
                throw new AppError_1.AppError("Colegio no encontrado", 404);
            }
            if (existing.estudiante_id !== estudianteId) {
                throw new AppError_1.AppError("El colegio no pertenece a este estudiante", 403);
            }
            const { colegio: colegioData } = req.body;
            const updated = yield ColegioAnteriorRepository_1.ColegioAnteriorRepository.update(colegioId, colegioData);
            res.status(200).json({
                success: true,
                message: "Colegio actualizado exitosamente",
                data: updated,
            });
        }));
        // DELETE /colegiosAnteriores/:estudianteId/:colegioId
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const colegioId = Number(req.params.colegioId);
            const estudianteId = Number(req.params.estudianteId);
            const existing = yield ColegioAnteriorRepository_1.ColegioAnteriorRepository.findById(colegioId);
            if (!existing) {
                throw new AppError_1.AppError("Colegio no encontrado", 404);
            }
            if (existing.estudiante_id !== estudianteId) {
                throw new AppError_1.AppError("El colegio no pertenece a este estudiante", 403);
            }
            yield ColegioAnteriorRepository_1.ColegioAnteriorRepository.delete(colegioId);
            res.status(200).json({
                success: true,
                message: "Colegio anterior eliminado exitosamente"
            });
        }));
    }
}
exports.ColegioAnteriorController = ColegioAnteriorController;
// =============================================================================
// VIVIENDA ESTUDIANTE
// Datos socioeconómicos: tipo de vivienda, materiales, servicios.
// También usa patrón upsert
// =============================================================================
class ViviendaEstudianteController {
    constructor() {
        // GET /viviendaEstudiante/:estudianteId
        this.getByEstudiante = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const estudianteId = Number(req.params.estudianteId);
                yield assertEstudianteExists(estudianteId);
                const vivienda = yield ViviendaEstudianteRepository_1.ViviendaEstudianteRepository.findByEstudianteId(estudianteId);
                res.status(200).json({
                    success: true,
                    data: vivienda !== null && vivienda !== void 0 ? vivienda : null,
                });
            }
            catch (error) {
                next(error);
            }
        }));
        // PUT /viviendaEstudiante/:estudianteId
        this.upsert = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            try {
                const estudianteId = Number(req.params.estudianteId);
                yield assertEstudianteExists(estudianteId);
                const { vivienda: viviendaData } = req.body;
                const vivienda = yield ViviendaEstudianteRepository_1.ViviendaEstudianteRepository.upsert(estudianteId, viviendaData);
                res.status(200).json({
                    success: true,
                    message: "Datos de vivienda guardados exitosamente",
                    data: vivienda,
                });
            }
            catch (error) {
                next(error);
            }
        }));
        // DELETE /viviendaEstudiante/:estudianteId
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const estudianteId = Number(req.params.estudianteId);
                yield assertEstudianteExists(estudianteId);
                const vivienda = yield ViviendaEstudianteRepository_1.ViviendaEstudianteRepository.delete(estudianteId);
                if (!vivienda) {
                    throw new AppError_1.AppError("Datos de vivienda no encontrados para este estudiante", 404);
                }
                res.status(200).json({
                    success: true,
                    message: "Datos de vivienda eliminados exitosamente",
                });
            }
            catch (error) {
                next(error);
            }
        }));
    }
}
exports.ViviendaEstudianteController = ViviendaEstudianteController;
// =============================================================================
// EXPEDIENTE COMPLETO
// Endpoint compuesto que opera sobre las 3 secciones a la vez.
// GET: trae todo en paralelo con Promise.all (1 redondeo de red en lugar de 3).
// PUT: guarda todo en una sola transacción — cada sección es opcional,
//      manda solo lo que cambió.
//
// Analogía: como "Guardar todo" en un IDE — guarda todos los archivos
// abiertos de una sola vez en lugar de uno por uno.
// =============================================================================
class ExpedienteController {
    constructor() {
        // GET /expediente/:estudianteId
        this.getExpediente = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const estudianteId = Number(req.params.estudianteId);
                yield assertEstudianteExists(estudianteId);
                // Promise.all ejecuta las 3 consultas en paralelo —
                // el tiempo total es el de la más lenta, no la suma de las 3
                const [ficha, colegios, vivienda] = yield Promise.all([
                    FichaEstudianteRepository_1.FichaEstudianteRepository.findByEstudianteId(estudianteId),
                    ColegioAnteriorRepository_1.ColegioAnteriorRepository.findByEstudianteId(estudianteId),
                    ViviendaEstudianteRepository_1.ViviendaEstudianteRepository.findByEstudianteId(estudianteId),
                ]);
                res.status(200).json({
                    success: true,
                    data: {
                        ficha: ficha !== null && ficha !== void 0 ? ficha : null,
                        colegios: colegios !== null && colegios !== void 0 ? colegios : [],
                        vivienda: vivienda !== null && vivienda !== void 0 ? vivienda : null,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        }));
        // PUT /expediente/:estudianteId
        this.upsertExpediente = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            try {
                const estudianteId = Number(req.params.estudianteId);
                yield assertEstudianteExists(estudianteId);
                const { ficha, colegios, vivienda } = req.body;
                const result = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                    const [fichaResult, colegiosResult, viviendaResult] = yield Promise.all([
                        ficha ? FichaEstudianteRepository_1.FichaEstudianteRepository.upsert(estudianteId, ficha, client) : null,
                        colegios ? ColegioAnteriorRepository_1.ColegioAnteriorRepository.replaceAll(estudianteId, colegios, client) : null,
                        vivienda ? ViviendaEstudianteRepository_1.ViviendaEstudianteRepository.upsert(estudianteId, vivienda, client) : null,
                    ]);
                    return { ficha: fichaResult, colegios: colegiosResult, vivienda: viviendaResult };
                }));
                res.status(200).json({
                    success: true,
                    message: "Expediente del estudiante guardado exitosamente",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        }));
    }
}
exports.ExpedienteController = ExpedienteController;
//# sourceMappingURL=fichaEstudiante.controller.js.map