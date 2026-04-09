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
exports.TipoArchivoController = void 0;
const TipoArchivoRepository_1 = require("../models/Repository/TipoArchivoRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
const asyncHandler_1 = require("../utils/asyncHandler");
const types_1 = require("../types");
class TipoArchivoController {
    constructor() {
        /**
         * Obtener todos los tipos de archivo
         */
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const tiposArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.findAll();
            res.status(200).json({
                success: true,
                data: tiposArchivo,
            });
        }));
        /**
         * Obtener tipo de archivo por rol de perosna
         */
        this.getRolByTipoArchivo = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const rol = req.params.rol;
            if (!Object.values(types_1.ContextoArchivo).includes(rol)) {
                throw new AppError_1.AppError("Rol de persona no válido", 400);
            }
            const tiposArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.findByRol(rol);
            if (!tiposArchivo.length) {
                throw new AppError_1.AppError("No se encontraron tipos de archivo para el rol indicado", 404);
            }
            res.status(200).json({
                success: true,
                data: tiposArchivo,
            });
        }));
        /**
         * Obtener tipo de archivo por ID
         */
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.findById(id);
            if (!tipoArchivo) {
                throw new AppError_1.AppError("Tipo de archivo no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: tipoArchivo,
            });
        }));
        /**
         * Buscar tipo de archivo por nombre
         */
        this.getByNombre = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.findByNombre(nombre);
            if (!tipoArchivo) {
                throw new AppError_1.AppError("Tipo de archivo no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: tipoArchivo,
            });
        }));
        /**
         * Crear un nuevo tipo de archivo
         */
        this.create = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const { tipo_archivo: TipoArchivoData } = req.body;
            // Verificar que no exista un tipo con el mismo nombre
            const existingTipo = yield TipoArchivoRepository_1.TipoArchivoRepository.findByNombre(TipoArchivoData.nombre);
            if (existingTipo) {
                throw new AppError_1.AppError("Ya existe un tipo de archivo con ese nombre", 409);
            }
            const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.create(TipoArchivoData);
            res.status(201).json({
                success: true,
                message: "Tipo de archivo creado exitosamente",
                data: tipoArchivo,
            });
        }));
        /**
         * Actualizar un tipo de archivo
         */
        this.update = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const id = Number(req.params.id);
            const { tipo_archivo: TipoArchivoData } = req.body;
            const existingTipo = yield TipoArchivoRepository_1.TipoArchivoRepository.findById(id);
            if (!existingTipo) {
                throw new AppError_1.AppError("Tipo de archivo no encontrado", 404);
            }
            // Si se intenta cambiar el nombre, verificar que no exista otro con ese nombre
            if (TipoArchivoData.nombre && TipoArchivoData.nombre !== existingTipo.nombre) {
                const tipoConNombre = yield TipoArchivoRepository_1.TipoArchivoRepository.findByNombre(TipoArchivoData.nombre);
                if (tipoConNombre) {
                    throw new AppError_1.AppError("Ya existe otro tipo de archivo con ese nombre", 409);
                }
            }
            const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.update(id, TipoArchivoData);
            if (!tipoArchivo) {
                throw new AppError_1.AppError("Tipo de archivo no encontrado o sin cambios", 404);
            }
            res.status(200).json({
                success: true,
                message: "Tipo de archivo actualizado exitosamente",
                data: tipoArchivo,
            });
        }));
        /**
         * Eliminar un tipo de archivo (soft delete)
         */
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.softDelete(id);
            if (!tipoArchivo) {
                throw new AppError_1.AppError("Tipo de archivo no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                message: "Tipo de archivo eliminado exitosamente",
            });
        }));
        /**
         * Verificar si una extensión es permitida
         */
        this.checkExtension = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const { extension } = req.query;
            if (!extension) {
                throw new AppError_1.AppError("La extensión es requerida", 400);
            }
            const isAllowed = yield TipoArchivoRepository_1.TipoArchivoRepository.isExtensionAllowed(id, extension);
            res.status(200).json({
                success: true,
                data: {
                    tipo_archivo_id: id,
                    extension,
                    permitida: isAllowed,
                },
            });
        }));
    }
}
exports.TipoArchivoController = TipoArchivoController;
//# sourceMappingURL=tipoArchivo.controller.js.map