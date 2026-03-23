import { Router } from "express"
import { UserController } from "../controllers/user.controller"
import { authenticate, isAdmin, isSelfOrAdmin } from "../middleware/auth"
import { searchValidator, idValidator } from "../utils/validators"
import { validate } from "../middleware/validate"
import { body, param } from "express-validator"

const router = Router()
const userController = new UserController()

// Todas las rutas requieren autenticación
router.use(authenticate)

// Buscar usuarios (cualquier usuario autenticado)
router.get("/search",
  searchValidator,
  validate,
  userController.searchUsers.bind(userController))

// Obtener usuario por ID (solo admin o el mismo usuario)
router.get("/getById/:id",
  idValidator,
  validate,
  isSelfOrAdmin,
  userController.getUser.bind(userController))

// Asignar rol de administrador (solo admin)
// router.post("/:id/assign-admin",
//   isAdmin,
//   idValidator,
//   validate,
//   userController.assignAdmin.bind(userController))

// Transferir rol de administrador (solo admin)
router.post(
  "/transfer-admin",
  isAdmin,
  body("toUserId").isInt({ min: 1 }).withMessage("ID de usuario destino inválido"),
  validate,
  userController.transferAdmin.bind(userController),
)

// Activar/desactivar usuario (solo admin)
router.patch(
  "/:id/status/:activo",
  isAdmin,
  idValidator,
  param("activo").isBoolean().withMessage("activo debe ser booleano"),
  validate,
  userController.toggleStatus.bind(userController),
)

export default router
