import { Router } from "express"
import { param, body } from "express-validator"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { validate } from "../middleware/validate"
import { DecretoController } from "../controllers/decreto.controller"
import { Recurso, Accion } from "../types"

const router = Router()
const ctrl = new DecretoController()

router.use(authenticate)

router.get("/getAll", checkPermission(Recurso.DECRETOS, Accion.READ), ctrl.getAll.bind(ctrl))

router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  checkPermission(Recurso.DECRETOS, Accion.READ),
  ctrl.getById.bind(ctrl)
)

router.post(
  "/create",
  [
    body("decreto").isObject().withMessage("El objeto decreto es requerido"),
    body("decreto.codigo").isString().notEmpty().isLength({ max: 10 }).withMessage("El código es requerido (máx 10 caracteres)"),
    body("decreto.nombre").isString().notEmpty().isLength({ max: 100 }).withMessage("El nombre es requerido (máx 100 caracteres)"),
    body("decreto.descripcion").optional().isString(),
  ],
  validate,
  checkPermission(Recurso.DECRETOS, Accion.CREATE),
  ctrl.create.bind(ctrl)
)

router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  [
    body("decreto").isObject().withMessage("El objeto decreto es requerido"),
    body("decreto.codigo").optional().isString().notEmpty().isLength({ max: 10 }),
    body("decreto.nombre").optional().isString().notEmpty().isLength({ max: 100 }),
    body("decreto.descripcion").optional().isString(),
  ],
  validate,
  checkPermission(Recurso.DECRETOS, Accion.UPDATE),
  ctrl.update.bind(ctrl)
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  checkPermission(Recurso.DECRETOS, Accion.DELETE),
  ctrl.delete.bind(ctrl)
)

export default router
