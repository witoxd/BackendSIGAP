import { Router } from "express"
import { ReemplazoProfesorController } from "../controllers/reemplazoProfesor.controller"
import { authenticate } from "../middleware/auth"

const router = Router()
const ctrl   = new ReemplazoProfesorController()

router.use(authenticate)
router.get( "/profesor/:profesorId", ctrl.getByProfesor)
router.post("/create",               ctrl.create)
router.put( "/cerrar/:id",           ctrl.cerrar)

export default router
