import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { EstudianteController } from "../controllers/estudiante.controller"
import { 
  createEstudianteHttpValidator, 
  updateEstudianteHttpValidator 
} from "../validators/estudiante.validators"
import { 
  validateCreateEstudianteDomain, 
  validateUpdateEstudianteDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const estudianteController = new EstudianteController()

router.use(authenticate)

router.get(
  "/getAll",
  checkPermission(Recurso.ESTUDIANTES, Accion.READ),
  estudianteController.getAll.bind(estudianteController),
)

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.READ),
  estudianteController.getById.bind(estudianteController),
)

router.get(
  "/getByDocumento/:numero_documento",
  param("numero_documento").isString().withMessage("Documento invalido"),
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.READ),
  estudianteController.getByDocumento.bind(estudianteController)
)

router.post(
  "/create",
  createEstudianteHttpValidator,
  validate,
  validateCreateEstudianteDomain,
  checkPermission(Recurso.ESTUDIANTES, Accion.CREATE),
  estudianteController.create.bind(estudianteController),
)

router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateEstudianteHttpValidator,
  validate,
  validateUpdateEstudianteDomain,
  checkPermission(Recurso.ESTUDIANTES, Accion.UPDATE),
  estudianteController.update.bind(estudianteController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.DELETE),
  estudianteController.delete.bind(estudianteController),
)

export default router
