import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission, isAdmin } from "../middleware/acl"
import { PermisoController } from "../controllers/permiso.controller"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"


const router = Router()
const permisoController = new PermisoController()

router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Permisos
 *     description: Consulta de permisos del sistema por rol
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Permiso:
 *       type: object
 *       properties:
 *         permiso_id:
 *           type: integer
 *           example: 1
 *         rol:
 *           type: string
 *           example: profesor
 *         recurso:
 *           type: string
 *           example: ESTUDIANTES
 *         accion:
 *           type: string
 *           example: READ
 */

/**
 * @swagger
 * /permisos:
 *   get:
 *     summary: Listar todos los permisos del sistema
 *     tags: [Permisos]
 *     responses:
 *       200:
 *         description: Lista de permisos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permiso'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/", checkPermission(Recurso.PERMISOS, Accion.READ), permisoController.getAll.bind(permisoController))

/**
 * @swagger
 * /permisos/{id}:
 *   get:
 *     summary: Obtener un permiso por ID (solo admin)
 *     tags: [Permisos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permiso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Permiso'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  isAdmin,
  checkPermission(Recurso.PERMISOS, Accion.READ),
  permisoController.getById.bind(permisoController),
)

// router.post(
//   "/",
//   createPermisoValidator,
//   validate,
//   checkPermission(Recurso.PERMISOS, Accion.CREATE),
//   permisoController.create.bind(permisoController),
// )

// router.put(
//   "/:id",
//   param("id").isInt({ min: 1 }).withMessage("ID inválido"),
//   validate,
//   checkPermission(Recurso.PERMISOS, Accion.UPDATE),
//   permisoController.create.bind(permisoController),
// )


export default router
