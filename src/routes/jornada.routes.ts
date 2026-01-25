import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { JornadaController } from "../controllers/jornada.controller"
import { 
  createJornadaHttpValidator, 
  updateJornadaHttpValidator 
} from "../validators/jornada.validators"
import { 
  validateCreateJornadaDomain, 
  validateUpdateJornadaDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const jornadaController = new JornadaController()

router.use(authenticate)

router.get("/getAll", checkPermission(Recurso.JORNADAS, Accion.READ), jornadaController.getAll.bind(jornadaController))

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.JORNADAS, Accion.READ),
  jornadaController.getById.bind(jornadaController),
)

router.post(
  "/create",
  createJornadaHttpValidator,
  validate,
  validateCreateJornadaDomain,
  checkPermission(Recurso.JORNADAS, Accion.CREATE),
  jornadaController.create.bind(jornadaController),
)

router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateJornadaHttpValidator,
  validate,
  validateUpdateJornadaDomain,
  checkPermission(Recurso.JORNADAS, Accion.UPDATE),
  jornadaController.update.bind(jornadaController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.JORNADAS, Accion.DELETE),
  jornadaController.delete.bind(jornadaController),
)

export default router
