import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { EgresadoController } from "../controllers/egresado.controller"
import { 
  createEgresadoHttpValidator, 
  updateEgresadoHttpValidator 
} from "../validators/egresado.validators"
import { 
  validateCreateEgresadoDomain, 
  validateUpdateEgresadoDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const egresadoController = new EgresadoController()

router.use(authenticate)

router.get("/getAll", checkPermission(Recurso.ESTUDIANTES, Accion.READ), egresadoController.getAll.bind(egresadoController))

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.READ),
  egresadoController.getById.bind(egresadoController),
)

router.post(
  "/create",
  createEgresadoHttpValidator,
  validate,
  validateCreateEgresadoDomain,
  checkPermission(Recurso.ESTUDIANTES, Accion.CREATE),
  egresadoController.create.bind(egresadoController),
)

router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateEgresadoHttpValidator,
  validate,
  validateUpdateEgresadoDomain,
  checkPermission(Recurso.ESTUDIANTES, Accion.UPDATE),
  egresadoController.update.bind(egresadoController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.DELETE),
  egresadoController.delete.bind(egresadoController),
)

export default router
