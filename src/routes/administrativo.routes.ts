import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { AdministrativoController } from "../controllers/administrativo.controller"
import { 
  createAdministrativoHttpValidator, 
  updateAdministrativoHttpValidator 
} from "../validators/administrativo.validators"
import { 
  validateCreateAdministrativoDomain, 
  validateUpdateAdministrativoDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const administrativoController = new AdministrativoController()

router.use(authenticate)

router.get(
  "/getAll",
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.READ),
  administrativoController.getAll.bind(administrativoController),
)

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.READ),
  administrativoController.getById.bind(administrativoController),
)

router.get(
  "/searchIndex/:index",
  param("index").isString().withMessage("Index de busqueda invalido"),
  validate,
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.READ),
  administrativoController.SearchIndex.bind(administrativoController)
)

router.post(
  "/create",
  createAdministrativoHttpValidator,
  validate,
  validateCreateAdministrativoDomain,
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.CREATE),
  administrativoController.create.bind(administrativoController),
)


router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateAdministrativoHttpValidator,
  validate,
  validateUpdateAdministrativoDomain,
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.UPDATE),
  administrativoController.update.bind(administrativoController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.DELETE),
  administrativoController.delete.bind(administrativoController),
)

export default router
