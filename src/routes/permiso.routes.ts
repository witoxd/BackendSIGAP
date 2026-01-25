import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission, isAdmin } from "../middleware/acl"
import { PermisoController } from "../controllers/permiso.controller"
import { createPermisoValidator } from "../validators/permiso.validators"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"


const router = Router()
const permisoController = new PermisoController()

router.use(authenticate)

router.get("/", checkPermission(Recurso.PERMISOS, Accion.READ), permisoController.getAll.bind(permisoController))

router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  isAdmin,
  checkPermission(Recurso.PERMISOS, Accion.READ),
  permisoController.getById.bind(permisoController),
)

// router.post(
//   "/",
//   createPermisoValidator,
//   validate,
//   checkPermission(Recurso.PERMISOS, Accion.CREATE),
//   permisoController.create.bind(permisoController),
// )

// router.put(
//   "/:id",
//   param("id").isInt({ min: 1 }).withMessage("ID inválido"),
//   validate,
//   checkPermission(Recurso.PERMISOS, Accion.UPDATE),
//   permisoController.create.bind(permisoController),
// )


export default router
