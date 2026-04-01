import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { MatriculaController } from "../controllers/matricula.controller"
import { 
  createMatriculaHttpValidator, 
  updateMatriculaHttpValidator 
} from "../validators/matricula.validators"
import { 
  validateCreateMatriculaDomain, 
  validateUpdateMatriculaDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"
import { upload } from "../config/multer"

const router = Router()
const matriculaController = new MatriculaController()

router.use(authenticate)

router.get("/getAll", checkPermission(Recurso.MATRICULAS, Accion.READ), matriculaController.getAll.bind(matriculaController))

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  matriculaController.getById.bind(matriculaController),
)

router.post(
  "/create",
  createMatriculaHttpValidator,
  validate,
  upload.array("archivos"),
  validateCreateMatriculaDomain,
  checkPermission(Recurso.MATRICULAS, Accion.CREATE),
  matriculaController.ProcessMatricula.bind(matriculaController),
)

router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateMatriculaHttpValidator,
  validate,
  validateUpdateMatriculaDomain,
  checkPermission(Recurso.MATRICULAS, Accion.UPDATE),
  matriculaController.update.bind(matriculaController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.DELETE),
  matriculaController.delete.bind(matriculaController),
)

export default router
