"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileExists = exports.getFileUrl = exports.deleteFile = exports.uploadConfig = exports.handleMulterError = exports.upload = exports.isAllowedMimeType = exports.getMaxFileSizeFormatted = exports.getAllowedExtensions = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const AppError_1 = require("../utils/AppError");
// ============================================================================
// CONFIGURACION DE ALMACENAMIENTO DE ARCHIVOS
// ============================================================================
// Directorio base para almacenar archivos subidos
// MODIFICAR: Cambiar esta ruta segun el entorno de produccion
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || "uploads";
// Subdirectorios por tipo de archivo
const UPLOAD_SUBDIRS = {
    documento: "documento",
    certificado: "certificado",
    diploma: "diploma",
    constancia: "constancia",
    carta: "carta",
    otro: "otro"
};
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
    // "image/webp": [".webp"],
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
// ============================================================================
// CONFIGURACION DE MULTER - ALMACENAMIENTO EN DISCO
// ============================================================================
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Determinar subdirectorio basado en el tipo de archivo del body
        const tipoArchivo = req.body.tipo_archivo || "otro";
        const subdir = UPLOAD_SUBDIRS[tipoArchivo] || UPLOAD_SUBDIRS.otro;
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
    },
    filename: (req, file, cb) => {
        const uniqueFilename = generateUniqueFilename(file.originalname);
        cb(null, uniqueFilename);
    },
});
// ============================================================================
// FILTRO DE ARCHIVOS
// ============================================================================
const fileFilter = (req, file, cb) => {
    console.log(file);
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
        files: 5, // Solo 5 archivos por request (cambiar si se requiere)
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
    subdirs: UPLOAD_SUBDIRS,
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