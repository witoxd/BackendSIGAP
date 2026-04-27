import { Router } from "express"
import { UserController } from "../controllers/user.controller"
import { authenticate, isAdmin, isSelfOrAdmin } from "../middleware/auth"
import { searchValidator, idValidator } from "../utils/validators"
import { validate } from "../middleware/validate"
import { param } from "express-validator"

const router = Router()
const userController = new UserController()

// Todas las rutas requieren autenticación
router.use(authenticate)

// =============================================================================
// SWAGGER — Definición del tag y schemas locales
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Gestión de usuarios del sistema (activar/desactivar, transferir admin)
 */

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Buscar usuarios por nombre o username
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de usuarios encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuario_id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       rol:
 *                         type: string
 *                       activo:
 *                         type: boolean
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Buscar usuarios (cualquier usuario autenticado)
router.get("/search",
  searchValidator,
  validate,
  userController.searchUsers.bind(userController))

/**
 * @swagger
 * /users/getById/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (solo admin o el propio usuario)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
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
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Obtener usuario por ID (solo admin o el mismo usuario)
router.get("/getById/:id",
  idValidator,
  validate,
  isSelfOrAdmin,
  userController.getUser.bind(userController))

  // No implementar, se le asigna el rol admin pero, no quita el rol del anterior usuario
  // Mejor usar transferer admin, para evitar que mas de un usuario tenga el rol admin.
  
// Asignar rol de administrador (solo admin)
// router.post("/:id/assign-admin",
//   isAdmin,
//   idValidator,
//   validate,
//   userController.assignAdmin.bind(userController))

/**
 * @swagger
 * /users/transfer-admin/toUser/{id}:
 *   post:
 *     summary: Transferir el rol de administrador a otro usuario (solo admin)
 *     description: Quita el rol de admin al usuario autenticado y lo asigna al usuario destino. Usar este endpoint en vez de assign-admin para garantizar que solo un usuario tenga el rol.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *         description: ID del usuario que recibirá el rol de administrador
 *     responses:
 *       200:
 *         description: Rol de administrador transferido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Rol de administrador transferido exitosamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Transferir rol de administrador (solo admin)
router.post(
  "/transfer-admin/toUser/:id",
  isAdmin,
  param("id").isInt({ min: 1 }).withMessage("ID de usuario destino inválido"),
  validate,
  userController.transferAdmin.bind(userController),
)

/**
 * @swagger
 * /users/{id}/status/{activo}:
 *   patch:
 *     summary: Activar o desactivar un usuario (solo admin)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: path
 *         name: activo
 *         required: true
 *         schema:
 *           type: boolean
 *         description: true para activar, false para desactivar
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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
