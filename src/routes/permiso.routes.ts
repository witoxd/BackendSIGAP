import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission, isAdmin } from "../middleware/acl"
import { PermisoController } from "../controllers/permiso.controller"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const permisoController = new PermisoController()

router.use(authenticate)

// GET /permisos — todos los permisos del sistema
router.get("/", checkPermission(Recurso.PERMISOS, Accion.READ), permisoController.getAll.bind(permisoController))

// GET /permisos/role/:roleId — permisos asignados a un rol (estática antes de /:id)
router.get(
  "/role/:roleId",
  param("roleId").isInt({ min: 1 }).withMessage("ID de rol inválido"),
  validate,
  isAdmin,
  permisoController.getByRole.bind(permisoController),
)

// GET /permisos/:id — permiso por ID
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  isAdmin,
  checkPermission(Recurso.PERMISOS, Accion.READ),
  permisoController.getById.bind(permisoController),
)

// POST /permisos/:roleId/assign/:permisoId — asignar permiso a rol
router.post(
  "/:roleId/assign/:permisoId",
  param("roleId").isInt({ min: 1 }).withMessage("ID de rol inválido"),
  param("permisoId").isInt({ min: 1 }).withMessage("ID de permiso inválido"),
  validate,
  isAdmin,
  permisoController.assignToRole.bind(permisoController),
)

// DELETE /permisos/:roleId/remove/:permisoId — remover permiso de rol
router.delete(
  "/:roleId/remove/:permisoId",
  param("roleId").isInt({ min: 1 }).withMessage("ID de rol inválido"),
  param("permisoId").isInt({ min: 1 }).withMessage("ID de permiso inválido"),
  validate,
  isAdmin,
  permisoController.removeFromRole.bind(permisoController),
)

export default router
