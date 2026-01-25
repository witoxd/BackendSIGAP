import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { CursoController } from "../controllers/curso.controller"
import { 
  createCursoHttpValidator, 
  updateCursoHttpValidator 
} from "../validators/curso.validators"
import { 
  validateCreateCursoDomain, 
  validateUpdateCursoDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const cursoController = new CursoController()

router.use(authenticate)

router.get("/getAll", checkPermission(Recurso.CURSOS, Accion.READ), cursoController.getAll.bind(cursoController))

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.CURSOS, Accion.READ),
  cursoController.getById.bind(cursoController),
)

router.post(
  "/create",
  createCursoHttpValidator,
  validate,
  validateCreateCursoDomain,
  checkPermission(Recurso.CURSOS, Accion.CREATE),
  cursoController.create.bind(cursoController),
)

router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateCursoHttpValidator,
  validate,
  validateUpdateCursoDomain,
  checkPermission(Recurso.CURSOS, Accion.UPDATE),
  cursoController.update.bind(cursoController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.CURSOS, Accion.DELETE),
  cursoController.delete.bind(cursoController),
)

export default router
