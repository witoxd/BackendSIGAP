import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission, isAdmin } from "../middleware/acl"
import { ProcesoInscripcionController } from "../controllers/procesoInscripcion.controller"
import {
  createProcesoInscripcionValidator,
  updateProcesoInscripcionValidator,
  procesoInscripcionIdValidator,
  periodoIdParamValidator,
} from "../validators/procesoInscripcion.validators"
import { validate } from "../middleware/validate"
import { Recurso, Accion } from "../types"

const router = Router()
const controller = new ProcesoInscripcionController()

router.use(authenticate)

/**
 * @swagger
 * tags:
 *   - name: ProcesosInscripcion
 *     description: Gestión de procesos de inscripción dentro de un período de matrícula
 */

// Consultas
router.get(
  "/getAll",
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  controller.getAll
)

router.get(
  "/vigente",
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  controller.getVigente
)

router.get(
  "/getByPeriodo/:periodoId",
  periodoIdParamValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  controller.getByPeriodo
)

router.get(
  "/getById/:id",
  procesoInscripcionIdValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  controller.getById
)

// Mutaciones — solo admin
router.post(
  "/create",
  isAdmin,
  createProcesoInscripcionValidator,
  validate,
  controller.create
)

router.put(
  "/update/:id",
  isAdmin,
  procesoInscripcionIdValidator,
  updateProcesoInscripcionValidator,
  validate,
  controller.update
)

router.delete(
  "/delete/:id",
  isAdmin,
  procesoInscripcionIdValidator,
  validate,
  controller.delete
)

export default router
