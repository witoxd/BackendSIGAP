import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { AuditoriaController } from "../controllers/auditoria.controller"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const auditoriaController = new AuditoriaController()

router.use(authenticate)

/**
 * @swagger
 * tags:
 *   - name: Auditoría
 *     description: Registro de acciones realizadas en el sistema
 */

/**
 * @swagger
 * /auditoria:
 *   get:
 *     summary: Listar todos los registros de auditoría
 *     tags: [Auditoría]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de registros
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/", checkPermission(Recurso.PERMISOS, Accion.READ), auditoriaController.getAll.bind(auditoriaController))

/**
 * @swagger
 * /auditoria/usuario/{usuarioId}:
 *   get:
 *     summary: Registros de auditoría de un usuario
 *     tags: [Auditoría]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registros del usuario
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/usuario/:usuarioId",
  param("usuarioId").isInt({ min: 1 }).withMessage("ID de usuario inválido"),
  validate,
  checkPermission(Recurso.PERMISOS, Accion.READ),
  auditoriaController.getByUsuarioId.bind(auditoriaController),
)

/**
 * @swagger
 * /auditoria/accion/{accion}:
 *   get:
 *     summary: Filtrar registros por tipo de acción
 *     tags: [Auditoría]
 *     parameters:
 *       - in: path
 *         name: accion
 *         required: true
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT]
 *     responses:
 *       200:
 *         description: Registros filtrados
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/accion/:accion",
  param("accion").notEmpty().withMessage("Acción requerida"),
  validate,
  checkPermission(Recurso.PERMISOS, Accion.READ),
  auditoriaController.getByAccion.bind(auditoriaController),
)

/**
 * @swagger
 * /auditoria/tabla/{tabla}:
 *   get:
 *     summary: Filtrar registros por tabla afectada
 *     tags: [Auditoría]
 *     parameters:
 *       - in: path
 *         name: tabla
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registros filtrados por tabla
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/tabla/:tabla",
  param("tabla").notEmpty().withMessage("Nombre de tabla requerido"),
  validate,
  checkPermission(Recurso.PERMISOS, Accion.READ),
  auditoriaController.getByTabla.bind(auditoriaController),
)

/**
 * @swagger
 * /auditoria/{id}:
 *   get:
 *     summary: Obtener un registro de auditoría por ID
 *     tags: [Auditoría]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro encontrado
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
  checkPermission(Recurso.PERMISOS, Accion.READ),
  auditoriaController.getById.bind(auditoriaController),
)

export default router
