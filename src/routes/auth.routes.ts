import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { registerValidator, loginValidator, changePasswordValidator } from "../utils/validators"
import {
  createUserHttpValidator,
  createUserWithPersonaHttpValidator,
  resetPasswordHttpValidator,
} from "../validators/auth.validators"
import {
  validateCreateUserDomain,
  validateCreateUserWithPersonaDomain,
  validateResetPasswordDomain,
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { authenticate, isAdmin } from "../middleware/auth"
import { authRateLimiter } from "../middleware/rateLimiter"
import { canCreateUser, checkPermission } from "../middleware/acl"
import { Accion, Recurso } from "../types"

const router = Router()
const authController = new AuthController()

const createUserMiddlewares = [
  authenticate,
  isAdmin,
  canCreateUser,
  ...createUserHttpValidator,
  validate,
  validateCreateUserDomain,
]

const createUserWithPersonaMiddlewares = [
  authenticate,
  isAdmin,
  canCreateUser,
  ...createUserWithPersonaHttpValidator,
  validate,
  validateCreateUserWithPersonaDomain,
]

const resetPasswordMiddlewares = [
  authenticate,
  isAdmin,
  checkPermission(Recurso.USUARIOS, Accion.UPDATE),
  ...resetPasswordHttpValidator,
  validate,
  validateResetPasswordDomain,
]

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
  "/users/with-persona",
  ...createUserWithPersonaMiddlewares,
  authController.createUserWithPersona.bind(authController)
)



router.post(
  "/create-user/:personaId",
  ...createUserMiddlewares,
  authController.createUser.bind(authController)
)



router.post(
  "/resetPassword/:id",
  ...resetPasswordMiddlewares,
  authController.resetPassword.bind(authController)
)


export default router
