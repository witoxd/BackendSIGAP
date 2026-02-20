import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { ProfesorController } from "../controllers/profesor.controller"
import { 
  createProfesorHttpValidator, 
  updateProfesorHttpValidator 
} from "../validators/profesor.validators"
import { 
  validateCreateProfesorDomain, 
  validateUpdateProfesorDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const profesorController = new ProfesorController()

router.use(authenticate)

router.get("/getAll", checkPermission(Recurso.PROFESORES, Accion.READ), profesorController.getAll.bind(profesorController))

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.PROFESORES, Accion.READ),
  profesorController.getById.bind(profesorController),
)

router.get(
  "/searchIndex/:index",
  param("index").isString().withMessage("Index de busqueda invalido"),
  validate,
  checkPermission(Recurso.PROFESORES, Accion.READ),
  profesorController.SearchIndex.bind(profesorController),
)

router.post(
  "/create",
  createProfesorHttpValidator,
  validate,
  validateCreateProfesorDomain,
  checkPermission(Recurso.PROFESORES, Accion.CREATE),
  profesorController.create.bind(profesorController),
)


router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateProfesorHttpValidator,
  validate,
  validateUpdateProfesorDomain,
  checkPermission(Recurso.PROFESORES, Accion.UPDATE),
  profesorController.update.bind(profesorController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.PROFESORES, Accion.DELETE),
  profesorController.delete.bind(profesorController),
)

export default router
