import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { registerValidator, loginValidator, changePasswordValidator } from "../utils/validators"
import { validate } from "../middleware/validate"
import { authenticate, isAdmin } from "../middleware/auth"
import { authRateLimiter } from "../middleware/rateLimiter"
import { canCreateUser, checkPermission } from "../middleware/acl"
import { Accion, Recurso } from "../types"

const router = Router()
const authController = new AuthController()

// Rutas públicas (con rate limiting estricto)
router.post(
  "/register",
  authenticate,
  canCreateUser,
  authRateLimiter,
  registerValidator,
  validate,
  authController.register.bind(authController),
)

router.post("/login",
  authRateLimiter,
  loginValidator,
  validate,
  authController.login.bind(authController))

// Rutas protegidas
router.get("/me",
  authenticate,
  authController.me.bind(authController))

router.post(
  "/change-password",
  authenticate,
  changePasswordValidator,
  validate,
  authController.changePassword.bind(authController),
)

router.post(
  "/create-user",
  authenticate,
  isAdmin,
  validate,
  canCreateUser,
  authController.createUser.bind(authController)
)

router.post(
  "/create-user-persona",
  authenticate,
  isAdmin,
  validate,
  canCreateUser,
  authController.createUserWithPersona.bind(authController)
)

router.post(
  "/resetPasswordByDefault/:id",
  authenticate,
  isAdmin,
  checkPermission(Recurso.USUARIOS, Accion.UPDATE),
  authController.ResetPassword.bind(authController)
)


export default router
