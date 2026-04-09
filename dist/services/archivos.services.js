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
exports.archivoService = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = require("../config/multer");
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const TipoArchivoRepository_1 = require("../models/Repository/TipoArchivoRepository");
const AppError_1 = require("../utils/AppError");
const ArchivoRepository_1 = require("../models/Repository/ArchivoRepository");
class archivoService {
    static deleteFileArray(files) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all(files.map(file => (0, multer_1.deleteFile)(file.path)));
            }
            catch (error) {
                console.error("Error limpiado archivos: ", error);
            }
        });
    }
    static normalizeMetadata(metadata) {
        if (!metadata) {
            return [];
        }
        if (typeof metadata === "string") {
            try {
                const parsedMetadata = JSON.parse(metadata);
                if (!Array.isArray(parsedMetadata)) {
                    throw new AppError_1.AppError("El formato de metadata no es válido", 400);
                }
                return parsedMetadata;
            }
            catch (error) {
                if (error instanceof AppError_1.AppError) {
                    throw error;
                }
                throw new AppError_1.AppError("El formato de metadata no es válido", 400);
            }
        }
        if (Array.isArray(metadata)) {
            return metadata.map((item) => {
                if (typeof item === "string") {
                    try {
                        return JSON.parse(item);
                    }
                    catch (_a) {
                        throw new AppError_1.AppError("El formato de metadata no es válido", 400);
                    }
                }
                return item;
            });
        }
        throw new AppError_1.AppError("El formato de metadata no es válido", 400);
    }
    static RegisterFileArray(files, metadata, personaId, userId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!files || files.length === 0) {
                    throw new AppError_1.AppError("Se requiere al menos un archivo", 400);
                }
                // Verificar que la persona existe
                const persona = yield PersonaRepository_1.PersonaRepository.findById(personaId);
                if (!persona) {
                    yield archivoService.deleteFileArray(files);
                    throw new AppError_1.AppError("Persona no encontrada", 404);
                }
                // Validar que haya metadata para cada archivo
                if (metadata.length !== files.length) {
                    yield archivoService.deleteFileArray(files);
                    throw new AppError_1.AppError(`Se requiere metadata para cada archivo. Archivos: ${files.length}, Metadata: ${metadata.length}`, 400);
                }
                // Construir array de datos con validaciones
                const archivosData = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const meta = metadata[i];
                    if (!meta || meta.tipo_archivo_id === undefined || meta.tipo_archivo_id === null) {
                        yield archivoService.deleteFileArray(files);
                        throw new AppError_1.AppError(`Falta tipo_archivo_id en la metadata del archivo ${file.originalname}`, 400);
                    }
                    const tipoArchivoId = Number(meta.tipo_archivo_id);
                    if (Number.isNaN(tipoArchivoId) || tipoArchivoId <= 0) {
                        yield archivoService.deleteFileArray(files);
                        throw new AppError_1.AppError(`tipo_archivo_id inválido en la metadata del archivo ${file.originalname}`, 400);
                    }
                    // Verificar tipo de archivo
                    const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.findById(tipoArchivoId);
                    if (!tipoArchivo) {
                        yield archivoService.deleteFileArray(files);
                        throw new AppError_1.AppError(`Tipo de archivo con ID ${tipoArchivoId} no encontrado`, 404);
                    }
                    // Verificar que la persona tiene permiso para subir este tipo de archivo
                    const personaPuedeSubirArchivo = yield PersonaRepository_1.PersonaRepository.personaPuedeSubirArchivo(personaId, tipoArchivoId);
                    if (!personaPuedeSubirArchivo) {
                        yield archivoService.deleteFileArray(files);
                        throw new AppError_1.AppError(`La persona no tiene permiso para subir este tipo de archivo: ${tipoArchivoId}`, 403);
                    }
                    // Verificar extensión permitida
                    const ext = path_1.default.extname(file.originalname).toLowerCase();
                    const isAllowed = yield TipoArchivoRepository_1.TipoArchivoRepository.isExtensionAllowed(tipoArchivoId, ext);
                    if (!isAllowed) {
                        yield archivoService.deleteFileArray(files);
                        throw new AppError_1.AppError(`La extensión ${ext} no está permitida para ${tipoArchivo.nombre} (archivo: ${file.originalname})`, 400);
                    }
                    archivosData.push({
                        persona_id: personaId,
                        tipo_archivo_id: tipoArchivoId,
                        nombre: file.originalname,
                        descripcion: meta.descripcion || undefined,
                        url_archivo: (0, multer_1.getFileUrl)(file),
                        asignado_por: userId,
                    });
                }
                const archivos = yield ArchivoRepository_1.ArchivoRepository.bulkCreate(archivosData, client);
                return archivos.map((archivo, index) => (Object.assign(Object.assign({}, archivo), { file_info: {
                        originalName: files[index].originalname,
                        size: files[index].size,
                        mimetype: files[index].mimetype,
                    } })));
            }
            catch (error) {
                yield archivoService.deleteFileArray(files);
                throw error;
            }
        });
    }
}
exports.archivoService = archivoService;
//# sourceMappingURL=archivos.services.js.map