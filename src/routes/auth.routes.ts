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

// =============================================================================
// SWAGGER — Definición del tag y schemas locales
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticación, registro y gestión de usuarios del sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       required: [username, password]
 *       properties:
 *         username:
 *           type: string
 *           example: jperez
 *         password:
 *           type: string
 *           format: password
 *           example: "MiPassword123!"
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         token:
 *           type: string
 *           description: JWT para usar en cabecera Authorization Bearer
 *         user:
 *           type: object
 *           properties:
 *             usuario_id:
 *               type: integer
 *             username:
 *               type: string
 *             rol:
 *               type: string
 *
 *     ChangePasswordBody:
 *       type: object
 *       required: [currentPassword, newPassword]
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *         newPassword:
 *           type: string
 *           format: password
 *
 *     CreateUserWithPersonaBody:
 *       type: object
 *       required: [persona, user]
 *       properties:
 *         persona:
 *           type: object
 *           required: [nombres, apellido_paterno, numero_documento, tipo_documento_id, genero, fecha_nacimiento]
 *           properties:
 *             nombres:
 *               type: string
 *               example: Juan
 *             apellido_paterno:
 *               type: string
 *               example: Pérez
 *             apellido_materno:
 *               type: string
 *             numero_documento:
 *               type: string
 *               example: "1020304050"
 *             tipo_documento_id:
 *               type: integer
 *               example: 1
 *             genero:
 *               type: string
 *               enum: [M, F]
 *             fecha_nacimiento:
 *               type: string
 *               format: date
 *         user:
 *           type: object
 *           required: [username, password, rol]
 *           properties:
 *             username:
 *               type: string
 *               example: jperez
 *             password:
 *               type: string
 *               format: password
 *             rol:
 *               type: string
 *               example: profesor
 */

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

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario (requiere autenticación de admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: nuevo_usuario
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Errores de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       200:
 *         description: Login exitoso — retorna el token JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Demasiados intentos — rate limit activo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login",
  authRateLimiter,
  loginValidator,
  validate,
  authController.login.bind(authController))

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Datos del usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuario_id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     rol:
 *                       type: string
 *                     activo:
 *                       type: boolean
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Rutas protegidas
router.get("/me",
  authenticate,
  authController.me.bind(authController))

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Cambiar la contraseña del usuario autenticado
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordBody'
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Contraseña actual incorrecta o validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  "/change-password",
  authenticate,
  changePasswordValidator,
  validate,
  authController.changePassword.bind(authController),
)

/**
 * @swagger
 * /auth/users/with-persona:
 *   post:
 *     summary: Crear usuario con persona asociada en una sola transacción (solo admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserWithPersonaBody'
 *     responses:
 *       201:
 *         description: Usuario y persona creados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuario_id:
 *                       type: integer
 *                     username:
 *                       type: string
 *       400:
 *         description: Errores de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Username o documento ya existentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  "/users/with-persona",
  ...createUserWithPersonaMiddlewares,
  authController.createUserWithPersona.bind(authController)
)



/**
 * @swagger
 * /auth/create-user/{personaId}:
 *   post:
 *     summary: Crear usuario para una persona existente (solo admin)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona a la que se asignará el usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, rol]
 *             properties:
 *               username:
 *                 type: string
 *                 example: jperez
 *               password:
 *                 type: string
 *                 format: password
 *               rol:
 *                 type: string
 *                 example: profesor
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Errores de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  "/create-user/:personaId",
  ...createUserMiddlewares,
  authController.createUser.bind(authController)
)



/**
 * @swagger
 * /auth/resetPassword/{id}:
 *   post:
 *     summary: Resetear la contraseña de un usuario (solo admin)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario al que se le reseteará la contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NuevaPassword123!"
 *     responses:
 *       200:
 *         description: Contraseña reseteada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Errores de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  "/resetPassword/:id",
  ...resetPasswordMiddlewares,
  authController.resetPassword.bind(authController)
)


export default router
