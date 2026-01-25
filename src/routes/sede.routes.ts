import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { SedeController } from "../controllers/sede.controller"
import {
  createSedeHttpValidator,
  updateSedeHttpValidator
} from "../validators/sede.validators"
import {
  validateCreateSedeDomain,
  validateUpdateSedeDomain
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const sedeController = new SedeController()

router.use(authenticate)

router.get(
  "/getAll",
  checkPermission(Recurso.SEDES, Accion.READ),
  sedeController.getAll.bind(sedeController))

router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.SEDES, Accion.READ),
  sedeController.getById.bind(sedeController),
)

router.post(
  "/",
  createSedeHttpValidator,
  validate,
  validateCreateSedeDomain,
  checkPermission(Recurso.SEDES, Accion.CREATE),
  sedeController.create.bind(sedeController),
)

router.put(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateSedeHttpValidator,
  validate,
  validateUpdateSedeDomain,
  checkPermission(Recurso.SEDES, Accion.UPDATE),
  sedeController.update.bind(sedeController),
)

router.delete(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.SEDES, Accion.DELETE),
  sedeController.delete.bind(sedeController),
)

export default router
