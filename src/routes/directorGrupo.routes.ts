import { Router } from "express"
import { body, param } from "express-validator"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { validate } from "../middleware/validate"
import { DirectorGrupoController } from "../controllers/directorGrupo.controller"
import { Recurso, Accion } from "../types"

const router = Router()
const ctrl = new DirectorGrupoController()

router.use(authenticate)

router.get(
  "/profesor/:profesorId",
  param("profesorId").isInt({ min: 1 }),
  validate,
  checkPermission(Recurso.PROFESORES, Accion.READ),
  ctrl.getByProfesor.bind(ctrl),
)

router.get(
  "/curso/:cursoId",
  param("cursoId").isInt({ min: 1 }),
  validate,
  checkPermission(Recurso.CURSOS, Accion.READ),
  ctrl.getByCurso.bind(ctrl),
)

router.get(
  "/periodo/:periodoId",
  param("periodoId").isInt({ min: 1 }),
  validate,
  checkPermission(Recurso.CURSOS, Accion.READ),
  ctrl.getByPeriodo.bind(ctrl),
)

router.post(
  "/create",
  [
    body("curso_id").isInt({ min: 1 }).withMessage("curso_id requerido"),
    body("periodo_id").isInt({ min: 1 }).withMessage("periodo_id requerido"),
    body("profesor_id").isInt({ min: 1 }).withMessage("profesor_id requerido"),
  ],
  validate,
  checkPermission(Recurso.CURSOS, Accion.UPDATE),
  ctrl.create.bind(ctrl),
)

router.put(
  "/update/:id",
  [
    param("id").isInt({ min: 1 }),
    body("profesor_id").isInt({ min: 1 }).withMessage("profesor_id requerido"),
  ],
  validate,
  checkPermission(Recurso.CURSOS, Accion.UPDATE),
  ctrl.update.bind(ctrl),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }),
  validate,
  checkPermission(Recurso.CURSOS, Accion.DELETE),
  ctrl.delete.bind(ctrl),
)

export default router
