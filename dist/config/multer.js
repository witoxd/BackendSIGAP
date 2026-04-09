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
exports.fileExists = exports.getFileUrl = exports.deleteFile = exports.uploadConfig = exports.handleMulterError = exports.upload = exports.isAllowedMimeType = exports.getMaxFileSizeFormatted = exports.getAllowedExtensions = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const AppError_1 = require("../utils/AppError");
const TipoArchivoRepository_1 = require("../models/Repository/TipoArchivoRepository");
// ============================================================================
// CONFIGURACION DE ALMACENAMIENTO DE ARCHIVOS
// ============================================================================
// Directorio base para almacenar archivos subidos
// MODIFICAR: Cambiar esta ruta segun el entorno de produccion
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || "uploads";
// Subdirectorios por tipo de archivo
// ============================================================================
// FILTRO DE TIPOS DE ARCHIVO PERMITIDOS
// ============================================================================
// MODIFICAR: Agregar o quitar MIME types segun los formatos permitidos
// Actualmente solo permite PDF
const ALLOWED_MIME_TYPES = {
    // PDF
    "application/pdf": [".pdf"],
    // -------------------------------------------------------------------------
    // DESCOMENTAR las siguientes lineas para agregar mas formatos:
    // -------------------------------------------------------------------------
    // Imagenes
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    // "image/gif": [".gif"],
    "image/webp": [".webp"],
    // Documentos de Office
    // "application/msword": [".doc"],
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    // "application/vnd.ms-excel": [".xls"],
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    // "application/vnd.ms-powerpoint": [".ppt"],
    // "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    // Texto plano
    // "text/plain": [".txt"],
    // "text/csv": [".csv"],
};
// ============================================================================
// LIMITE DE TAMANO DE ARCHIVO
// ============================================================================
// MODIFICAR: Cambiar el valor para ajustar el tamano maximo permitido
// Valor en bytes: 5 * 1024 * 1024 = 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// Para referencia:
// 1MB  = 1 * 1024 * 1024
// 5MB  = 5 * 1024 * 1024
// 10MB = 10 * 1024 * 1024
// 25MB = 25 * 1024 * 1024
// 50MB = 50 * 1024 * 1024
// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================
/**
 * Obtiene la lista de extensiones permitidas para mostrar en mensajes de error
 */
const getAllowedExtensions = () => {
    const extensions = [];
    Object.values(ALLOWED_MIME_TYPES).forEach((exts) => {
        extensions.push(...exts);
    });
    return [...new Set(extensions)];
};
exports.getAllowedExtensions = getAllowedExtensions;
/**
 * Obtiene el tamano maximo en formato legible
 */
const getMaxFileSizeFormatted = () => {
    const mb = MAX_FILE_SIZE / (1024 * 1024);
    return `${mb}MB`;
};
exports.getMaxFileSizeFormatted = getMaxFileSizeFormatted;
/**
 * Verifica si un MIME type esta permitido
 */
const isAllowedMimeType = (mimeType) => {
    return Object.keys(ALLOWED_MIME_TYPES).includes(mimeType);
};
exports.isAllowedMimeType = isAllowedMimeType;
/**
 * Crea el directorio si no existe
 */
const ensureDirectoryExists = (dirPath) => {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
};
/**
 * Genera un nombre de archivo unico
 */
const generateUniqueFilename = (originalname, personaId, tipoArchivo) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = path_1.default.extname(originalname).toLowerCase();
    const safeBase = path_1.default.basename(originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, "_")
        .substring(0, 40);
    const personaPart = personaId ? `p${personaId}` : "anon";
    const tipoPart = tipoArchivo ? tipoArchivo.toLowerCase() : "doc";
    return `${personaPart}_${tipoPart}_${safeBase}_${timestamp}_${randomString}${ext}`;
};
const tiposArchivoCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
/**
 * Obtiene un tipo de archivo con caché inteligente
 * Consulta en tiempo real pero reutiliza datos si están dentro del TTL
 * Esto garantiza integridad de datos (verificar estado activo/inactivo)
 * mientras optimiza rendimiento
 */
const getTipoArchivo = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const cached = tiposArchivoCache.get(id);
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    try {
        const data = yield TipoArchivoRepository_1.TipoArchivoRepository.findById(id);
        tiposArchivoCache.set(id, { data, timestamp: now });
        return data;
    }
    catch (error) {
        tiposArchivoCache.delete(id);
        throw error;
    }
});
// ============================================================================
// CONFIGURACION DE MULTER - ALMACENAMIENTO EN DISCO
// ============================================================================
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const reqAny = req;
            if (reqAny._fileIndex === undefined)
                reqAny._fileIndex = 0;
            const currentIndex = reqAny._fileIndex++;
            // Parsear metadata (viene como string JSON desde el FormData)
            const metadata = JSON.parse(req.body.metadata);
            const tipoArchivo = Number((_a = metadata[currentIndex]) === null || _a === void 0 ? void 0 : _a.tipo_archivo_id);
            const existingTipoArchivoData = yield getTipoArchivo(tipoArchivo);
            if (!existingTipoArchivoData) {
                return cb(new AppError_1.AppError("Tipo de archivo no encontrado", 400), "");
            }
            // Validar integridad: verificar que el tipo esté activo (si existe propiedad activo)
            if (existingTipoArchivoData.activo === false) {
                return cb(new AppError_1.AppError("Tipo de archivo inactivo", 400), "");
            }
            const subdir = existingTipoArchivoData.nombre;
            console.log("tipo de archivo: ", tipoArchivo, " Y la sub direccion ala que va: ", subdir);
            const year = req.body.anio ||
                new Date().getFullYear().toString();
            const personaId = req.body.persona_id
                ? `persona_${req.body.persona_id}`
                : "sin_persona";
            const uploadPath = path_1.default.join(UPLOAD_BASE_DIR, subdir, year, personaId);
            // Crear directorio si no existe
            ensureDirectoryExists(uploadPath);
            cb(null, uploadPath);
        }
        catch (error) {
            cb(error, "");
        }
    }),
    filename: (req, file, cb) => {
        const uniqueFilename = generateUniqueFilename(file.originalname);
        cb(null, uniqueFilename);
    },
});
// ============================================================================
// FILTRO DE ARCHIVOS
// ============================================================================
const fileFilter = (req, file, cb) => {
    var _a;
    console.log(file, req.body, req.files);
    console.log("files:", req.files);
    console.log("files length:", (_a = req.files) === null || _a === void 0 ? void 0 : _a.length);
    // Verificar MIME type
    if (!(0, exports.isAllowedMimeType)(file.mimetype)) {
        const allowedExts = (0, exports.getAllowedExtensions)().join(", ");
        const error = new AppError_1.AppError(`Tipo de archivo no permitido. Solo se permiten: ${allowedExts}`, 400);
        return cb(error, false);
    }
    // Verificar extension del archivo
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowedExtsForMime = ALLOWED_MIME_TYPES[file.mimetype] || [];
    if (!allowedExtsForMime.includes(ext)) {
        const error = new AppError_1.AppError(`Extension de archivo invalida para el tipo ${file.mimetype}`, 400);
        return cb(error, false);
    }
    cb(null, true);
};
// ============================================================================
// INSTANCIA DE MULTER CONFIGURADA
// ============================================================================
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 10, // Solo 10 archivos por request (cambiar si se requiere)
    },
});
// ============================================================================
// MIDDLEWARE PARA MANEJO DE ERRORES DE MULTER
// ============================================================================
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return res.status(400).json({
                    success: false,
                    message: `El archivo excede el tamano maximo permitido de ${(0, exports.getMaxFileSizeFormatted)()}`,
                });
            case "LIMIT_FILE_COUNT":
                return res.status(400).json({
                    success: false,
                    message: "Se excedio el numero maximo de archivos permitidos",
                });
            case "LIMIT_UNEXPECTED_FILE":
                return res.status(400).json({
                    success: false,
                    message: "Campo de archivo inesperado",
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Error al subir archivo: ${err.message}`,
                });
        }
    }
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
};
exports.handleMulterError = handleMulterError;
// ============================================================================
// CONFIGURACION EXPORTADA PARA REFERENCIA
// ============================================================================
exports.uploadConfig = {
    baseDir: UPLOAD_BASE_DIR,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeFormatted: (0, exports.getMaxFileSizeFormatted)(),
    allowedExtensions: (0, exports.getAllowedExtensions)(),
};
// ============================================================================
// UTILIDADES PARA MANEJO DE ARCHIVOS
// ============================================================================
/**
 * Elimina un archivo del sistema de archivos
 */
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const fullPath = path_1.default.isAbsolute(filePath) ? filePath : path_1.default.join(process.cwd(), filePath);
        if (!fs_1.default.existsSync(fullPath)) {
            return resolve();
        }
        fs_1.default.unlink(fullPath, (err) => {
            if (err) {
                console.error(`Error al eliminar archivo: ${fullPath}`, err);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
exports.deleteFile = deleteFile;
/**
 * Obtiene la URL relativa del archivo para almacenar en la BD
 */
const getFileUrl = (file) => {
    return `/${file.path.replace(/\\/g, "/")}`;
};
exports.getFileUrl = getFileUrl;
/**
 * Verifica si un archivo existe
 */
const fileExists = (filePath) => {
    const fullPath = path_1.default.isAbsolute(filePath) ? filePath : path_1.default.join(process.cwd(), filePath);
    return fs_1.default.existsSync(fullPath);
};
exports.fileExists = fileExists;
//# sourceMappingURL=multer.js.map