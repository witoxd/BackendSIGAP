import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { AcudienteController } from "../controllers/acudiente.controller"
import { 
  createAcudienteHttpValidator, 
  updateAcudienteHttpValidator,
  assignAcudienteHttpValidator,
  removeEstudianteToAcudienteHttpValidator
} from "../validators/acudiente.validators"
import { 
  validateCreateAcudienteDomain, 
  validateUpdateAcudienteDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const acudienteController = new AcudienteController()

router.use(authenticate)

router.get("/getAll", checkPermission(Recurso.ACUDIENTES, Accion.READ), acudienteController.getAll.bind(acudienteController))

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.ACUDIENTES, Accion.READ),
  acudienteController.getById.bind(acudienteController),
)

router.post(
  "/create",
  createAcudienteHttpValidator,
  validate,
  validateCreateAcudienteDomain,
  checkPermission(Recurso.ACUDIENTES, Accion.CREATE),
  acudienteController.create.bind(acudienteController),
)


router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateAcudienteHttpValidator,
  validate,
  validateUpdateAcudienteDomain,
  checkPermission(Recurso.ACUDIENTES, Accion.UPDATE),
  acudienteController.update.bind(acudienteController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.ACUDIENTES, Accion.DELETE),
  acudienteController.delete.bind(acudienteController),
)

router.post(
  "/assignToEstudiante",
  assignAcudienteHttpValidator,
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.CREATE),
  acudienteController.assignToEstudiante.bind(acudienteController)
)

router.patch(
  "/removeFromEstudiante/estudiante/:estudianteId/acudiente/:acudienteId",
  removeEstudianteToAcudienteHttpValidator,
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.DELETE),
  acudienteController.removeFromEstudiante.bind(acudienteController)
)

export default router
