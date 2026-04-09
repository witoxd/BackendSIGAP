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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchivoController = void 0;
const ArchivoRepository_1 = require("../models/Repository/ArchivoRepository");
const TipoArchivoRepository_1 = require("../models/Repository/TipoArchivoRepository");
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const AppError_1 = require("../utils/AppError");
const validators_1 = require("../utils/validators");
const express_validator_1 = require("express-validator");
const multer_1 = require("../config/multer");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const asyncHandler_1 = require("../utils/asyncHandler");
const archivos_services_1 = require("../services/archivos.services");
class ArchivoController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit } = req.query;
            const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
            const archivos = yield ArchivoRepository_1.ArchivoRepository.findAll(pLimit, offset);
            const total = yield ArchivoRepository_1.ArchivoRepository.count();
            res.status(200).json({
                success: true,
                data: archivos,
                pagination: {
                    page: Math.floor(offset / pLimit) + 1,
                    limit: pLimit,
                    total,
                    pages: Math.ceil(total / pLimit),
                },
            });
        }));
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(id);
            if (!archivo) {
                throw new AppError_1.AppError("Archivo no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: archivo,
            });
        }));
        this.getByPersonaId = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const personaId = Number(req.params.personaId);
            const archivos = yield ArchivoRepository_1.ArchivoRepository.findByPersonaId(personaId);
            res.status(200).json({
                success: true,
                data: archivos,
            });
        }));
        this.getByTipo = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { tipo_archivo_id, page, limit } = req.query;
            const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
            if (!tipo_archivo_id) {
                throw new AppError_1.AppError("El ID del tipo de archivo es requerido", 400);
            }
            const archivos = yield ArchivoRepository_1.ArchivoRepository.findByTipo(Number(tipo_archivo_id), pLimit, offset);
            res.status(200).json({
                success: true,
                data: archivos,
            });
        }));
        this.getByTipoAndPersona = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { tipo_archivo_id, persona_id, page, limit } = req.query;
            const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
            if (!tipo_archivo_id || !persona_id) {
                throw new AppError_1.AppError("El ID del tipo de archivo y el ID de la persona son requeridos", 400);
            }
            const archivos = yield ArchivoRepository_1.ArchivoRepository.findByTipoAndPerson(Number(tipo_archivo_id), Number(persona_id), pLimit, offset);
            res.status(200).json({
                success: true,
                data: archivos,
            });
        }));
        this.getPhotoByPersonaId = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const personaId = Number(req.params.personaId);
            const archivo = yield ArchivoRepository_1.ArchivoRepository.findPhotoByPersonaId(personaId);
            if (!archivo) {
                throw new AppError_1.AppError("Foto no encontrada para esta persona", 404);
            }
            const filePath = path_1.default.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""));
            if (!fs_1.default.existsSync(filePath)) {
                throw new AppError_1.AppError("El archivo físico no existe", 404);
            }
            const ext = path_1.default.extname(filePath).toLowerCase();
            const contentTypes = {
                ".pdf": "application/pdf",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".gif": "image/gif",
                ".webp": "image/webp",
            };
            const contentType = contentTypes[ext] || "application/octet-stream";
            res.setHeader("Content-Type", contentType);
            res.setHeader("Content-Disposition", `inline; filename="${archivo.nombre}"`);
            res.sendFile(filePath);
        }));
        /**
         * Eliminar archivo (registro y archivo físico)
         */
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(id);
            if (!archivo) {
                throw new AppError_1.AppError("Archivo no encontrado", 404);
            }
            yield ArchivoRepository_1.ArchivoRepository.softDelete(id);
            if (archivo.url_archivo) {
                try {
                    const absolutePath = path_1.default.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""));
                    yield (0, multer_1.deleteFile)(absolutePath);
                }
                catch (deleteError) {
                    console.error("Error al eliminar archivo físico:", deleteError);
                }
            }
            res.status(200).json({
                success: true,
                message: "Archivo eliminado exitosamente",
            });
        }));
        /**
         * Descargar archivo
         */
        this.download = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(id);
            if (!archivo) {
                throw new AppError_1.AppError("Archivo no encontrado", 404);
            }
            const filePath = path_1.default.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""));
            if (!fs_1.default.existsSync(filePath)) {
                throw new AppError_1.AppError("El archivo físico no existe", 404);
            }
            res.setHeader("Content-Disposition", `attachment; filename="${archivo.nombre}"`);
            res.setHeader("Content-Type", "application/octet-stream");
            res.sendFile(filePath);
        }));
        /**
         * Ver archivo en navegador
         */
        this.view = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(id);
                if (!archivo) {
                    throw new AppError_1.AppError("Archivo no encontrado", 404);
                }
                const filePath = path_1.default.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""));
                if (!fs_1.default.existsSync(filePath)) {
                    throw new AppError_1.AppError("El archivo físico no existe", 404);
                }
                const ext = path_1.default.extname(filePath).toLowerCase();
                const contentTypes = {
                    ".pdf": "application/pdf",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".png": "image/png",
                    ".gif": "image/gif",
                    ".webp": "image/webp",
                };
                const contentType = contentTypes[ext] || "application/octet-stream";
                res.setHeader("Content-Type", contentType);
                res.setHeader("Content-Disposition", `inline; filename="${archivo.nombre}"`);
                res.sendFile(filePath);
            }
            catch (error) {
                next(error);
            }
        }));
    }
    /**
     * Crear un nuevo archivo con subida física
     */
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    if (req.file)
                        yield (0, multer_1.deleteFile)(req.file.path);
                    throw new AppError_1.AppError("Errores de validación", 400, errors.array());
                }
                const userId = req.user.userId;
                if (!req.file) {
                    throw new AppError_1.AppError("Se requiere un archivo", 400);
                }
                const { persona_id, descripcion, tipo_archivo_id } = req.body;
                // Verificar que la persona existe
                const persona = yield PersonaRepository_1.PersonaRepository.findById(Number(persona_id));
                if (!persona) {
                    yield (0, multer_1.deleteFile)(req.file.path);
                    throw new AppError_1.AppError("Persona no encontrada", 404);
                }
                // Verificar que el tipo de archivo existe
                const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.findById(Number(tipo_archivo_id));
                if (!tipoArchivo) {
                    yield (0, multer_1.deleteFile)(req.file.path);
                    throw new AppError_1.AppError("Tipo de archivo no encontrado", 404);
                }
                // Verificar que la persona tiene permiso para subir este tipo de archivo
                const personaPuedeSubirArchivo = yield PersonaRepository_1.PersonaRepository.personaPuedeSubirArchivo(Number(persona_id), Number(tipo_archivo_id));
                if (!personaPuedeSubirArchivo) {
                    yield (0, multer_1.deleteFile)(req.file.path);
                    throw new AppError_1.AppError("La persona no tiene permiso para subir este tipo de archivo", 403);
                }
                // Verificar que la extensión está permitida
                const ext = path_1.default.extname(req.file.originalname).toLowerCase();
                const isAllowed = yield TipoArchivoRepository_1.TipoArchivoRepository.isExtensionAllowed(Number(tipo_archivo_id), ext);
                if (!isAllowed) {
                    yield (0, multer_1.deleteFile)(req.file.path);
                    throw new AppError_1.AppError(`La extensión ${ext} no está permitida para el tipo de archivo ${tipoArchivo.nombre}`, 400);
                }
                const urlArchivo = (0, multer_1.getFileUrl)(req.file);
                const archivo = yield ArchivoRepository_1.ArchivoRepository.create({
                    persona_id: Number(persona_id),
                    tipo_archivo_id: Number(tipo_archivo_id),
                    nombre: req.file.originalname,
                    descripcion: descripcion || null,
                    url_archivo: urlArchivo,
                    asignado_por: userId,
                });
                res.status(201).json({
                    success: true,
                    message: "Archivo creado exitosamente",
                    data: Object.assign(Object.assign({}, archivo), { file_info: {
                            originalName: req.file.originalname,
                            size: req.file.size,
                            mimetype: req.file.mimetype,
                        } }),
                });
            }
            catch (error) {
                if (req.file) {
                    try {
                        yield (0, multer_1.deleteFile)(req.file.path);
                    }
                    catch (deleteError) {
                        console.error("Error al eliminar archivo:", deleteError);
                    }
                }
                next(error);
            }
        });
    }
    /**
     * Crear múltiples archivos con metadata individual
     * FORMATO:
     * - archivos: array de files
     * - persona_id: número
     * - metadata: JSON string array con: [{"tipo_archivo_id":1,"descripcion":"..."}, ...]
     */
    bulkCreate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    if (req.files) {
                        yield archivos_services_1.archivoService.deleteFileArray(req.files);
                    }
                    throw new AppError_1.AppError("Errores de validación", 400, errors.array());
                }
                const userId = req.user.userId;
                const files = req.files;
                if (!files || files.length === 0) {
                    throw new AppError_1.AppError("Se requiere al menos un archivo", 400);
                }
                const { persona_id, metadata } = req.body;
                const metadataArray = archivos_services_1.archivoService.normalizeMetadata(metadata);
                const archivos = yield archivos_services_1.archivoService.RegisterFileArray(files, metadataArray, Number(persona_id), userId);
                res.status(201).json({
                    success: true,
                    message: `${archivos.length} archivos creados exitosamente`,
                    total: archivos.length,
                    data: archivos,
                });
            }
            catch (error) {
                // Rollback: eliminar archivos físicos en caso de error
                if (req.files) {
                    try {
                        yield archivos_services_1.archivoService.deleteFileArray(req.files);
                    }
                    catch (deleteError) {
                        console.error("Error limpiando archivos:", deleteError);
                    }
                }
                next(error);
            }
        });
    }
    /**
     * Actualizar un archivo (opcionalmente con nuevo archivo físico)
     */
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    if (req.file)
                        yield (0, multer_1.deleteFile)(req.file.path);
                    throw new AppError_1.AppError("Errores de validación", 400, errors.array());
                }
                const id = Number(req.params.id);
                const archivoActual = yield ArchivoRepository_1.ArchivoRepository.findById(id);
                if (!archivoActual) {
                    if (req.file)
                        yield (0, multer_1.deleteFile)(req.file.path);
                    throw new AppError_1.AppError("Archivo no encontrado", 404);
                }
                const updateData = {
                    descripcion: req.body.descripcion,
                    tipo_archivo_id: req.body.tipo_archivo_id ? Number(req.body.tipo_archivo_id) : undefined,
                };
                // Si se actualiza el tipo de archivo, validar que existe
                if (updateData.tipo_archivo_id) {
                    const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.findById(updateData.tipo_archivo_id);
                    if (!tipoArchivo) {
                        if (req.file)
                            yield (0, multer_1.deleteFile)(req.file.path);
                        throw new AppError_1.AppError("Tipo de archivo no encontrado", 404);
                    }
                }
                if (req.file) {
                    const oldFilePath = archivoActual.url_archivo;
                    updateData.url_archivo = (0, multer_1.getFileUrl)(req.file);
                    updateData.nombre = req.file.originalname;
                    // Validar extensión si hay tipo de archivo
                    const tipoArchivoId = updateData.tipo_archivo_id || archivoActual.tipo_archivo_id;
                    const ext = path_1.default.extname(req.file.originalname).toLowerCase();
                    const isAllowed = yield TipoArchivoRepository_1.TipoArchivoRepository.isExtensionAllowed(tipoArchivoId, ext);
                    if (!isAllowed) {
                        yield (0, multer_1.deleteFile)(req.file.path);
                        const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.findById(tipoArchivoId);
                        throw new AppError_1.AppError(`La extensión ${ext} no está permitida para ${tipoArchivo === null || tipoArchivo === void 0 ? void 0 : tipoArchivo.nombre}`, 400);
                    }
                    const archivo = yield ArchivoRepository_1.ArchivoRepository.update(id, updateData);
                    // Eliminar archivo anterior
                    if (oldFilePath) {
                        try {
                            const absolutePath = path_1.default.join(process.cwd(), oldFilePath.replace(/^\//, ""));
                            yield (0, multer_1.deleteFile)(absolutePath);
                        }
                        catch (deleteError) {
                            console.error("Error al eliminar archivo anterior:", deleteError);
                        }
                    }
                    res.status(200).json({
                        success: true,
                        message: "Archivo actualizado exitosamente",
                        data: Object.assign(Object.assign({}, archivo), { file_info: {
                                originalName: req.file.originalname,
                                size: req.file.size,
                                mimetype: req.file.mimetype,
                            } }),
                    });
                }
                else {
                    const archivo = yield ArchivoRepository_1.ArchivoRepository.update(id, updateData);
                    if (!archivo) {
                        throw new AppError_1.AppError("Archivo no encontrado o sin cambios", 404);
                    }
                    res.status(200).json({
                        success: true,
                        message: "Archivo actualizado exitosamente",
                        data: archivo,
                    });
                }
            }
            catch (error) {
                if (req.file) {
                    try {
                        yield (0, multer_1.deleteFile)(req.file.path);
                    }
                    catch (deleteError) {
                        console.error("Error al eliminar archivo:", deleteError);
                    }
                }
                next(error);
            }
        });
    }
}
exports.ArchivoController = ArchivoController;
//# sourceMappingURL=archivo.controller.js.map