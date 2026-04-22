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

// =============================================================================
// CÓMO DOCUMENTAR UN ENDPOINT CON SWAGGER
// =============================================================================
// El bloque /** @swagger ... */ debe ir ANTES del router.get/post/etc.
// Usa indentación con espacios (no tabs) — YAML es sensible a la indentación.
// El tag debe coincidir con uno de los tags definidos abajo.
// Para referenciar schemas: $ref: '#/components/schemas/NombreSchema'
// Para referenciar respuestas: $ref: '#/components/responses/NombreRespuesta'
// =============================================================================

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
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de registros
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
 *                     $ref: '#/components/schemas/Auditoria'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/", checkPermission(Recurso.PERMISOS, Accion.READ), auditoriaController.getAll.bind(auditoriaController))

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
 *         description: ID del registro
 *     responses:
 *       200:
 *         description: Registro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Auditoria'
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

/**
 * @swagger
 * /auditoria/usuario/{usuarioId}:
 *   get:
 *     summary: Obtener registros de auditoría de un usuario específico
 *     tags: [Auditoría]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
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
 *         description: Registros del usuario
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
 *                     $ref: '#/components/schemas/Auditoria'
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
 *     summary: Filtrar registros de auditoría por tipo de acción
 *     tags: [Auditoría]
 *     parameters:
 *       - in: path
 *         name: accion
 *         required: true
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT]
 *         description: Tipo de acción a filtrar
 *     responses:
 *       200:
 *         description: Registros filtrados
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
 *                     $ref: '#/components/schemas/Auditoria'
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

export default router
