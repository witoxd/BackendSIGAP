import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { AuditoriaController } from "../controllers/auditoria.controller"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const auditoriaController = new AuditoriaController()

router.use(authenticate)

router.get("/", checkPermission(Recurso.PERMISOS, Accion.READ), auditoriaController.getAll.bind(auditoriaController))

router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  checkPermission(Recurso.PERMISOS, Accion.READ),
  auditoriaController.getById.bind(auditoriaController),
)

router.get(
  "/usuario/:usuarioId",
  param("usuarioId").isInt({ min: 1 }).withMessage("ID de usuario inválido"),
  validate,
  checkPermission(Recurso.PERMISOS, Accion.READ),
  auditoriaController.getByUsuarioId.bind(auditoriaController),
)

router.get(
  "/accion/:accion",
  param("accion").notEmpty().withMessage("Acción requerida"),
  validate,
  checkPermission(Recurso.PERMISOS, Accion.READ),
  auditoriaController.getByAccion.bind(auditoriaController),
)

export default router
