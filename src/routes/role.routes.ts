import { Router } from "express"
import { authenticate, isAdmin } from "../middleware/auth"

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// TODO: Implementar controladores de roles y permisos
// GET /api/roles - Listar roles (solo admin)
// POST /api/roles - Crear rol (solo admin)
// GET /api/roles/:id/permisos - Listar permisos de un rol (solo admin)
// POST /api/roles/:id/permisos - Asignar permiso a rol (solo admin)

router.get("/", isAdmin, (req, res) => {
  res.status(501).json({
    success: false,
    message: "Endpoint no implementado aún",
  })
})

export default router
