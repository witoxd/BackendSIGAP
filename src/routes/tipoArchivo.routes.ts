import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { TipoArchivoController } from "../controllers/tipoArchivo.controller"
import {
  createTipoArchivoHttpValidator,
  updateTipoArchivoHttpValidator,
  tipoArchivoIdValidator,
  tipoArchivoNombreValidator,
  tipoArchivoRolValidator,
  checkExtensionValidator,
} from "../validators/tipoArchivo.validators"
import {
  validateCreateTipoArchivoDomain,
  validateUpdateTipoArchivoDomain,
} from "../validators/domain/tipoArchivo.domain"
import { validate } from "../middleware/validate"
import { Recurso, Accion } from "../types"
import { param } from "express-validator"

const router = Router()
const tipoArchivoController = new TipoArchivoController()

router.use(authenticate)

// Obtener todos los tipos de archivo
router.get(
  "/getAll",
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.getAll.bind(tipoArchivoController)
)

// Obtener tipo de archivo por ID
router.get(
  "/getById/:id",
  tipoArchivoIdValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.getById.bind(tipoArchivoController)
)

// Obtener tipo de archivo por rol de persona
router.get(
  "/getByRol/:rol",
  tipoArchivoRolValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.getRolByTipoArchivo.bind(tipoArchivoController)
)

// Obtener tipo de archivo por nombre
router.get(
  "/getByNombre/:nombre",
  tipoArchivoNombreValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.getByNombre.bind(tipoArchivoController)
)

// Verificar si una extensión es permitida
router.get(
  "/checkExtension/:id",
  checkExtensionValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.checkExtension.bind(tipoArchivoController)
)

// Crear tipo de archivo
router.post(
  "/create",
  createTipoArchivoHttpValidator,
  validate,
  validateCreateTipoArchivoDomain,
  checkPermission(Recurso.DOCUMENTOS, Accion.CREATE),
  tipoArchivoController.create.bind(tipoArchivoController)
)

// Actualizar tipo de archivo
router.put(
  "/update/:id",
  tipoArchivoIdValidator,
  updateTipoArchivoHttpValidator,
  validate,
  validateUpdateTipoArchivoDomain,
  checkPermission(Recurso.DOCUMENTOS, Accion.UPDATE),
  tipoArchivoController.update.bind(tipoArchivoController)
)

// Eliminar tipo de archivo
router.delete(
  "/delete/:id",
  tipoArchivoIdValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.DELETE),
  tipoArchivoController.delete.bind(tipoArchivoController)
)

export default router
