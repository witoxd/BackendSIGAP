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
const AppError_1 = require("../utils/AppError");
const validators_1 = require("../utils/validators");
const express_validator_1 = require("express-validator");
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const multer_1 = require("../config/multer");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ArchivoController {
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
                const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(id);
                if (!archivo) {
                    throw new AppError_1.AppError("Archivo no encontrado", 404);
                }
                res.status(200).json({
                    success: true,
                    data: archivo,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getByPersonaId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const personaId = Number(req.params.personaId);
                const archivos = yield ArchivoRepository_1.ArchivoRepository.findByPersonaId(personaId);
                res.status(200).json({
                    success: true,
                    data: archivos,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getByTipo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tipo_archivo, page, limit } = req.query;
                const { limit: pLimit, offset } = (0, validators_1.getPagination)(page, limit);
                if (!tipo_archivo) {
                    throw new AppError_1.AppError("El tipo de archivo es requerido", 400);
                }
                const archivos = yield ArchivoRepository_1.ArchivoRepository.findByTipo(tipo_archivo, pLimit, offset);
                res.status(200).json({
                    success: true,
                    data: archivos,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Crear un nuevo registro de archivo con subida de archivo fisico
     * El archivo se sube usando multer y se guarda en el sistema de archivos
     */
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    // Si hay errores de validacion, eliminar el archivo subido si existe
                    if (req.file) {
                        yield (0, multer_1.deleteFile)(req.file.path);
                    }
                    throw new AppError_1.AppError("Errores de validacion", 400, errors.array());
                }
                const userId = req.user.userId;
                console.log("ID del usuario asignando: ", userId);
                // Verificar que se subio un archivo
                if (!req.file) {
                    throw new AppError_1.AppError("Se requiere un archivo", 400);
                }
                // Obtener datos del body
                const { persona_id, descripcion, tipo_archivo } = req.body;
                // Verificar que la persona existe
                const existingPersona = yield PersonaRepository_1.PersonaRepository.findById(Number(persona_id));
                if (!existingPersona) {
                    // Eliminar archivo subido si la persona no existe
                    yield (0, multer_1.deleteFile)(req.file.path);
                    throw new AppError_1.AppError("Persona asignada no existe", 404);
                }
                // Obtener URL del archivo subido
                const urlArchivo = (0, multer_1.getFileUrl)(req.file);
                // Crear registro en la base de datos
                const archivo = yield ArchivoRepository_1.ArchivoRepository.create({
                    persona_id: Number(persona_id),
                    nombre: req.file.originalname,
                    descripcion: descripcion || null,
                    tipo_archivo: tipo_archivo || "otro",
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
                // Limpiar archivo en caso de error
                if (req.file) {
                    try {
                        yield (0, multer_1.deleteFile)(req.file.path);
                    }
                    catch (deleteError) {
                        console.error("Error al eliminar archivo despues de fallo:", deleteError);
                    }
                }
                next(error);
            }
        });
    }
    //   /**
    //  * Crear uno o varios registros de archivos con subida fisica
    //  */
    bulkCreate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    // Eliminar archivos subidos si hay errores
                    if (req.files) {
                        yield Promise.all(req.files.map(file => (0, multer_1.deleteFile)(file.path)));
                    }
                    throw new AppError_1.AppError("Errores de validacion", 400, errors.array());
                }
                const userId = req.user.userId;
                const files = req.files;
                if (!files || files.length === 0) {
                    throw new AppError_1.AppError("Se requiere al menos un archivo", 400);
                }
                const { persona_id } = req.body;
                // Verificar persona
                const existingPersona = yield PersonaRepository_1.PersonaRepository.findById(Number(persona_id));
                if (!existingPersona) {
                    yield Promise.all(files.map(file => (0, multer_1.deleteFile)(file.path)));
                    throw new AppError_1.AppError("Persona asignada no existe", 404);
                }
                // Parsear metadata
                const metadataList = Array.isArray(req.body.metadata)
                    ? req.body.metadata.map((m) => JSON.parse(m))
                    : [];
                // Construir registros
                const archivosData = files.map((file, index) => {
                    const meta = metadataList.find((m) => m.index === index);
                    return {
                        persona_id: Number(persona_id),
                        nombre: file.originalname,
                        descripcion: (meta === null || meta === void 0 ? void 0 : meta.descripcion) || null,
                        tipo_archivo: (meta === null || meta === void 0 ? void 0 : meta.tipo_archivo) || "otro",
                        url_archivo: (0, multer_1.getFileUrl)(file),
                        asignado_por: userId,
                    };
                });
                // Guardar en BD
                const archivos = yield ArchivoRepository_1.ArchivoRepository.bulkCreate(archivosData);
                res.status(201).json({
                    success: true,
                    message: "Archivos creados exitosamente",
                    total: archivos.length,
                    data: archivos.map((archivo, index) => (Object.assign(Object.assign({}, archivo), { file_info: {
                            originalName: files[index].originalname,
                            size: files[index].size,
                            mimetype: files[index].mimetype,
                        } }))),
                });
            }
            catch (error) {
                // Rollback fisico
                if (req.files) {
                    try {
                        yield Promise.all(req.files.map(file => (0, multer_1.deleteFile)(file.path)));
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
     * Actualizar un registro de archivo
     * Opcionalmente puede incluir un nuevo archivo
     */
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    // Si hay errores de validacion, eliminar el nuevo archivo subido si existe
                    if (req.file) {
                        yield (0, multer_1.deleteFile)(req.file.path);
                    }
                    throw new AppError_1.AppError("Errores de validacion", 400, errors.array());
                }
                const id = Number(req.params.id);
                // Obtener archivo actual
                const archivoActual = yield ArchivoRepository_1.ArchivoRepository.findById(id);
                if (!archivoActual) {
                    // Eliminar nuevo archivo si el registro no existe
                    if (req.file) {
                        yield (0, multer_1.deleteFile)(req.file.path);
                    }
                    throw new AppError_1.AppError("Archivo no encontrado", 404);
                }
                const { archivo: updateData } = req.body;
                // Si se subio un nuevo archivo
                if (req.file) {
                    // Guardar ruta del archivo anterior para eliminarlo despues
                    const oldFilePath = archivoActual.url_archivo;
                    // Actualizar URL con el nuevo archivo
                    updateData.url_archivo = (0, multer_1.getFileUrl)(req.file);
                    // Actualizar registro en BD
                    const archivo = yield ArchivoRepository_1.ArchivoRepository.update(id, updateData);
                    // Eliminar archivo anterior del sistema de archivos
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
                    // Actualizacion sin cambio de archivo
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
                // Limpiar archivo nuevo en caso de error
                if (req.file) {
                    try {
                        yield (0, multer_1.deleteFile)(req.file.path);
                    }
                    catch (deleteError) {
                        console.error("Error al eliminar archivo despues de fallo:", deleteError);
                    }
                }
                next(error);
            }
        });
    }
    /**
     * Eliminar un archivo (registro y archivo fisico)
     */
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                // Obtener archivo para saber la ruta
                const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(id);
                if (!archivo) {
                    throw new AppError_1.AppError("Archivo no encontrado", 404);
                }
                // Eliminar registro de la BD
                yield ArchivoRepository_1.ArchivoRepository.delete(id);
                // Eliminar archivo fisico del sistema de archivos
                if (archivo.url_archivo) {
                    try {
                        const absolutePath = path_1.default.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""));
                        yield (0, multer_1.deleteFile)(absolutePath);
                    }
                    catch (deleteError) {
                        console.error("Error al eliminar archivo fisico:", deleteError);
                        // No lanzar error, el registro ya fue eliminado
                    }
                }
                res.status(200).json({
                    success: true,
                    message: "Archivo eliminado exitosamente",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Descargar un archivo
     */
    download(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(id);
                if (!archivo) {
                    throw new AppError_1.AppError("Archivo no encontrado", 404);
                }
                const filePath = path_1.default.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""));
                // Verificar que el archivo existe
                if (!fs_1.default.existsSync(filePath)) {
                    throw new AppError_1.AppError("El archivo fisico no existe en el servidor", 404);
                }
                // Configurar headers para descarga
                res.setHeader("Content-Disposition", `attachment; filename="${archivo.nombre}"`);
                res.setHeader("Content-Type", "application/octet-stream");
                // Enviar archivo
                res.sendFile(filePath);
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Ver archivo en el navegador (solo para PDFs e imagenes)
     */
    view(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(id);
                if (!archivo) {
                    throw new AppError_1.AppError("Archivo no encontrado", 404);
                }
                const filePath = path_1.default.join(process.cwd(), archivo.url_archivo.replace(/^\//, ""));
                // Verificar que el archivo existe
                if (!fs_1.default.existsSync(filePath)) {
                    throw new AppError_1.AppError("El archivo fisico no existe en el servidor", 404);
                }
                // Determinar content type
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
        });
    }
}
exports.ArchivoController = ArchivoController;
//# sourceMappingURL=archivo.controller.js.map