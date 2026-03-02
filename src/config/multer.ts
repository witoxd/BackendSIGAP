
import multer from "multer"
import path from "path"
import fs from "fs"
import { AppError } from "../utils/AppError"
import { TipoArchivoRepository } from "../models/Repository/TipoArchivoRepository"
// ============================================================================
// CONFIGURACION DE ALMACENAMIENTO DE ARCHIVOS
// ============================================================================

// Directorio base para almacenar archivos subidos
// MODIFICAR: Cambiar esta ruta segun el entorno de produccion
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || "uploads"

// Subdirectorios por tipo de archivo



// ============================================================================
// FILTRO DE TIPOS DE ARCHIVO PERMITIDOS
// ============================================================================
// MODIFICAR: Agregar o quitar MIME types segun los formatos permitidos
// Actualmente solo permite PDF
const ALLOWED_MIME_TYPES: { [key: string]: string[] } = {
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
}

// ============================================================================
// LIMITE DE TAMANO DE ARCHIVO
// ============================================================================
// MODIFICAR: Cambiar el valor para ajustar el tamano maximo permitido
// Valor en bytes: 5 * 1024 * 1024 = 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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
export const getAllowedExtensions = (): string[] => {
  const extensions: string[] = []
  Object.values(ALLOWED_MIME_TYPES).forEach((exts) => {
    extensions.push(...exts)
  })
  return [...new Set(extensions)]
}

/**
 * Obtiene el tamano maximo en formato legible
 */
export const getMaxFileSizeFormatted = (): string => {
  const mb = MAX_FILE_SIZE / (1024 * 1024)
  return `${mb}MB`
}

/**
 * Verifica si un MIME type esta permitido
 */
export const isAllowedMimeType = (mimeType: string): boolean => {
  return Object.keys(ALLOWED_MIME_TYPES).includes(mimeType)
}

/**
 * Crea el directorio si no existe
 */
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Genera un nombre de archivo unico
 */
const generateUniqueFilename = (
  originalname: string,
  personaId?: number | string,
  tipoArchivo?: string
): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalname).toLowerCase()

  const safeBase = path.basename(originalname, ext)
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 40)

  const personaPart = personaId ? `p${personaId}` : "anon"
  const tipoPart = tipoArchivo ? tipoArchivo.toLowerCase() : "doc"

  return `${personaPart}_${tipoPart}_${safeBase}_${timestamp}_${randomString}${ext}`
}

// ============================================================================
// CACHE CON TTL PARA TIPOS DE ARCHIVO
// ============================================================================

interface CachedTipoArchivo {
  data: any
  timestamp: number
}

const tiposArchivoCache = new Map<number, CachedTipoArchivo>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene un tipo de archivo con caché inteligente
 * Consulta en tiempo real pero reutiliza datos si están dentro del TTL
 * Esto garantiza integridad de datos (verificar estado activo/inactivo)
 * mientras optimiza rendimiento
 */
const getTipoArchivo = async (id: number): Promise<any> => {
  const cached = tiposArchivoCache.get(id)
  const now = Date.now()

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    const data = await TipoArchivoRepository.findById(id)
    tiposArchivoCache.set(id, { data, timestamp: now })
    return data
  } catch (error) {
    tiposArchivoCache.delete(id)
    throw error
  }
}


// ============================================================================
// CONFIGURACION DE MULTER - ALMACENAMIENTO EN DISCO
// ============================================================================

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      
      const reqAny = req as any
      if (reqAny._fileIndex === undefined) reqAny._fileIndex = 0
      const currentIndex = reqAny._fileIndex++

      // Parsear metadata (viene como string JSON desde el FormData)
      const metadata = JSON.parse(req.body.metadata)
      const tipoArchivo = Number(metadata[currentIndex]?.tipo_archivo_id)

      const existingTipoArchivoData = await getTipoArchivo(tipoArchivo)

      if (!existingTipoArchivoData) {
        return cb(new AppError("Tipo de archivo no encontrado", 400) as any, "")
      }

      // Validar integridad: verificar que el tipo esté activo (si existe propiedad activo)
      if (existingTipoArchivoData.activo === false) {
        return cb(new AppError("Tipo de archivo inactivo", 400) as any, "")
      }

      const subdir = existingTipoArchivoData.nombre

      console.log("tipo de archivo: ", tipoArchivo, " Y la sub direccion ala que va: ", subdir)
      const year =
        req.body.anio ||
        new Date().getFullYear().toString()

      const personaId = req.body.persona_id
        ? `persona_${req.body.persona_id}`
        : "sin_persona"

      const uploadPath = path.join(
        UPLOAD_BASE_DIR,
        subdir,
        year,
        personaId
      )

      // Crear directorio si no existe
      ensureDirectoryExists(uploadPath)

      cb(null, uploadPath)
    } catch (error) {
      cb(error as any, "")
    }
  },
  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFilename(file.originalname)
    cb(null, uniqueFilename)
  },
})

// ============================================================================
// FILTRO DE ARCHIVOS
// ============================================================================

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {

  console.log(file, req.body, req.files)
  console.log("files:", req.files)
  console.log("files length:", (req.files as any[])?.length)

  // Verificar MIME type
  if (!isAllowedMimeType(file.mimetype)) {
    const allowedExts = getAllowedExtensions().join(", ")
    const error = new AppError(
      `Tipo de archivo no permitido. Solo se permiten: ${allowedExts}`,
      400
    )
    return cb(error as any, false)
  }

  // Verificar extension del archivo
  const ext = path.extname(file.originalname).toLowerCase()
  const allowedExtsForMime = ALLOWED_MIME_TYPES[file.mimetype] || []
  if (!allowedExtsForMime.includes(ext)) {
    const error = new AppError(
      `Extension de archivo invalida para el tipo ${file.mimetype}`,
      400
    )
    return cb(error as any, false)
  }

  cb(null, true)
}

// ============================================================================
// INSTANCIA DE MULTER CONFIGURADA
// ============================================================================

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Solo 5 archivos por request (cambiar si se requiere)
  },
}
)

// ============================================================================
// MIDDLEWARE PARA MANEJO DE ERRORES DE MULTER
// ============================================================================

export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: `El archivo excede el tamano maximo permitido de ${getMaxFileSizeFormatted()}`,
        })
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Se excedio el numero maximo de archivos permitidos",
        })
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Campo de archivo inesperado",
        })
      default:
        return res.status(400).json({
          success: false,
          message: `Error al subir archivo: ${err.message}`,
        })
    }
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  next(err)
}

// ============================================================================
// CONFIGURACION EXPORTADA PARA REFERENCIA
// ============================================================================

export const uploadConfig = {
  baseDir: UPLOAD_BASE_DIR,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
  maxFileSize: MAX_FILE_SIZE,
  maxFileSizeFormatted: getMaxFileSizeFormatted(),
  allowedExtensions: getAllowedExtensions(),
}

// ============================================================================
// UTILIDADES PARA MANEJO DE ARCHIVOS
// ============================================================================

/**
 * Elimina un archivo del sistema de archivos
 */
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)

    if (!fs.existsSync(fullPath)) {
      return resolve()
    }

    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Error al eliminar archivo: ${fullPath}`, err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Obtiene la URL relativa del archivo para almacenar en la BD
 */
export const getFileUrl = (file: Express.Multer.File): string => {
  return `/${file.path.replace(/\\/g, "/")}`
}

/**
 * Verifica si un archivo existe
 */
export const fileExists = (filePath: string): boolean => {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  return fs.existsSync(fullPath)
}
