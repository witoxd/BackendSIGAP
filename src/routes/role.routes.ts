import { Router } from "express"
import { authenticate, isAdmin } from "../middleware/auth"

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)


router.get("/", isAdmin, (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint no implementado aún",
  })
})

export default router
