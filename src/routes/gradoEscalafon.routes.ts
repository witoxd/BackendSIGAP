import { Router } from "express"
import { param, body } from "express-validator"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { validate } from "../middleware/validate"
import { GradoEscalafonController } from "../controllers/gradoEscalafon.controller"
import { Recurso, Accion } from "../types"

const router = Router()
const ctrl = new GradoEscalafonController()

router.use(authenticate)

router.get("/getAll", checkPermission(Recurso.GRADOS_ESCALAFON, Accion.READ), ctrl.getAll.bind(ctrl))

router.get(
  "/getByDecretoId/:decretoId",
  param("decretoId").isInt({ min: 1 }).withMessage("ID de decreto inválido"),
  validate,
  checkPermission(Recurso.GRADOS_ESCALAFON, Accion.READ),
  ctrl.getByDecretoId.bind(ctrl)
)

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  checkPermission(Recurso.GRADOS_ESCALAFON, Accion.READ),
  ctrl.getById.bind(ctrl)
)

router.post(
  "/create",
  [
    body("grado").isObject().withMessage("El objeto grado es requerido"),
    body("grado.decreto_id").isInt({ min: 1 }).withMessage("El decreto es requerido"),
    body("grado.codigo").isString().notEmpty().isLength({ max: 10 }).withMessage("El código es requerido (máx 10 caracteres)"),
    body("grado.descripcion").optional().isString().isLength({ max: 100 }),
    body("grado.orden").optional().isInt({ min: 0 }),
  ],
  validate,
  checkPermission(Recurso.GRADOS_ESCALAFON, Accion.CREATE),
  ctrl.create.bind(ctrl)
)

router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  [
    body("grado").isObject().withMessage("El objeto grado es requerido"),
    body("grado.decreto_id").optional().isInt({ min: 1 }),
    body("grado.codigo").optional().isString().notEmpty().isLength({ max: 10 }),
    body("grado.descripcion").optional().isString().isLength({ max: 100 }),
    body("grado.orden").optional().isInt({ min: 0 }),
  ],
  validate,
  checkPermission(Recurso.GRADOS_ESCALAFON, Accion.UPDATE),
  ctrl.update.bind(ctrl)
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  checkPermission(Recurso.GRADOS_ESCALAFON, Accion.DELETE),
  ctrl.delete.bind(ctrl)
)

export default router
