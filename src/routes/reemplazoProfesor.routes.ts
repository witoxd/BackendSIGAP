import { Router } from "express"
import { ReemplazoProfesorController } from "../controllers/reemplazoProfesor.controller"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { Recurso, Accion } from "../types"

const router = Router()
const ctrl   = new ReemplazoProfesorController()

router.use(authenticate)

router.get( "/profesor/:profesorId", checkPermission(Recurso.PROFESORES, Accion.READ),   ctrl.getByProfesor)
router.post("/create",               checkPermission(Recurso.PROFESORES, Accion.UPDATE),  ctrl.create)
router.put( "/cerrar/:id",           checkPermission(Recurso.PROFESORES, Accion.UPDATE),  ctrl.cerrar)

export default router
