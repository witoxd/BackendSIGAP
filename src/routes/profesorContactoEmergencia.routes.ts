import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { ProfesorContactoEmergenciaController } from "../controllers/profesorContactoEmergencia.controller"
import { validate } from "../middleware/validate"
import { body, param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router({ mergeParams: true }) // hereda :profesorId del padre
const ctrl   = new ProfesorContactoEmergenciaController()

router.use(authenticate)

const contactoValidator = [
  body("nombre").isString().notEmpty().withMessage("El nombre es requerido"),
  body("parentesco").isString().notEmpty().withMessage("El parentesco es requerido"),
  body("telefono").isString().notEmpty().withMessage("El teléfono es requerido"),
  body("celular").optional().isString(),
]

router.get(
  "/",
  checkPermission(Recurso.PROFESORES, Accion.READ),
  ctrl.getByProfesor.bind(ctrl)
)

router.post(
  "/",
  contactoValidator, validate,
  checkPermission(Recurso.PROFESORES, Accion.UPDATE),
  ctrl.create.bind(ctrl)
)

router.put(
  "/:contactoId",
  param("contactoId").isInt({ min: 1 }),
  contactoValidator, validate,
  checkPermission(Recurso.PROFESORES, Accion.UPDATE),
  ctrl.update.bind(ctrl)
)

router.delete(
  "/:contactoId",
  param("contactoId").isInt({ min: 1 }), validate,
  checkPermission(Recurso.PROFESORES, Accion.UPDATE),
  ctrl.delete.bind(ctrl)
)

export default router
