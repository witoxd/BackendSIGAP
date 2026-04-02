import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { ArchivoController } from "../controllers/archivo.controller"
import {
  createArchivoHttpValidator,
  updateArchivoHttpValidator,
  bulkCreateArchivoHttpValidator
} from "../validators/archivo.validators"
import {
  validateCreateArchivoDomain,
  validateUpdateArchivoDomain
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param, query } from "express-validator"
import { Recurso, Accion } from "../types"
import { upload, handleMulterError } from "../config/multer"

const router = Router()
const archivoController = new ArchivoController()

router.use(authenticate)

// Obtener todos los archivos
router.get(
  "/getAll",
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getAll.bind(archivoController)
)

// Obtener archivo por ID
router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getById.bind(archivoController)
)

// Obtener archivos por persona
router.get(
  "/getByPersonaId/:personaId",
  param("personaId").isInt({ min: 1 }).withMessage("ID Invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getByPersonaId.bind(archivoController)
)

// Obtener archivos por tipo
router.get(
  "/getByTipo",
  query("tipo_archivo").notEmpty().withMessage("Tipo de archivo requerido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getByTipo.bind(archivoController)
)

// Descargar archivo
router.get(
  "/download/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.download.bind(archivoController)
)

// Ver archivo en navegador (para PDFs e imagenes)
router.get(
  "/view/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.view.bind(archivoController)
)

router.get(
  "/viewPhoto/:personaId",
  param("personaId").isInt({min: 1}).withMessage("ID de persona invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getPhotoByPersonaId.bind(archivoController)
)

// Crear archivo con subida de archivo
// El campo del archivo debe llamarse "archivo" en el form-data
router.post(
  "/create",
  checkPermission(Recurso.DOCUMENTOS, Accion.CREATE),
  upload.single("archivo"), // Middleware de multer para uno o varios archivos
  handleMulterError, // Manejo de errores de multer
  createArchivoHttpValidator,
  validate,
  validateCreateArchivoDomain,
  archivoController.create.bind(archivoController)
)

router.post(
  "/bulkCreate",
  checkPermission(Recurso.DOCUMENTOS, Accion.CREATE),
  upload.array("archivos"), // Middleware de multer para uno o varios archivos
  handleMulterError, // Manejo de errores de multer
  bulkCreateArchivoHttpValidator,
  validate,
  validateCreateArchivoDomain,
  archivoController.bulkCreate.bind(archivoController)
)

// Actualizar archivo (opcionalmente con nuevo archivo)
router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  checkPermission(Recurso.DOCUMENTOS, Accion.UPDATE),
  upload.single("archivo"), // Middleware de multer (opcional)
  handleMulterError,
  updateArchivoHttpValidator,
  validate,
  validateUpdateArchivoDomain,
  archivoController.update.bind(archivoController)
)

// Eliminar archivo
router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.DELETE),
  archivoController.delete.bind(archivoController)
)

export default router
