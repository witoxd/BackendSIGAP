import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { TipoDocumentoController } from "../controllers/tipoDocumento.controller"
import { 
  createTipoDocumentoHttpValidator, 
  updateTipoDocumentoHttpValidator 
} from "../validators/tipoDocumento.validators"
import { 
  validateCreateTipoDocumentoDomain, 
  validateUpdateTipoDocumentoDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const tipoDocumentoController = new TipoDocumentoController()

router.use(authenticate)

router.get(
  "/getAll",
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoDocumentoController.getAll.bind(tipoDocumentoController),
)

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoDocumentoController.getById.bind(tipoDocumentoController),
)

router.post(
  "/create",
  createTipoDocumentoHttpValidator,
  validate,
  validateCreateTipoDocumentoDomain,
  checkPermission(Recurso.DOCUMENTOS, Accion.CREATE),
  tipoDocumentoController.create.bind(tipoDocumentoController),
)

router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateTipoDocumentoHttpValidator,
  validate,
  validateUpdateTipoDocumentoDomain,
  checkPermission(Recurso.DOCUMENTOS, Accion.UPDATE),
  tipoDocumentoController.update.bind(tipoDocumentoController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.DELETE),
  tipoDocumentoController.delete.bind(tipoDocumentoController),
)

export default router
