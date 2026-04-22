import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { JornadaController } from "../controllers/jornada.controller"
import { 
  createJornadaHttpValidator, 
  updateJornadaHttpValidator 
} from "../validators/jornada.validators"
import { 
  validateCreateJornadaDomain, 
  validateUpdateJornadaDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const jornadaController = new JornadaController()

router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Jornadas
 *     description: Gestión de jornadas académicas (mañana, tarde, noche, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Jornada:
 *       type: object
 *       properties:
 *         jornada_id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Mañana
 *         hora_inicio:
 *           type: string
 *           example: "07:00"
 *         hora_fin:
 *           type: string
 *           example: "12:30"
 *         activo:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /jornadas/getAll:
 *   get:
 *     summary: Listar todas las jornadas académicas
 *     tags: [Jornadas]
 *     responses:
 *       200:
 *         description: Lista de jornadas
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
 *                     $ref: '#/components/schemas/Jornada'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/getAll", checkPermission(Recurso.JORNADAS, Accion.READ), jornadaController.getAll.bind(jornadaController))

/**
 * @swagger
 * /jornadas/getById/{id}:
 *   get:
 *     summary: Obtener una jornada por ID
 *     tags: [Jornadas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jornada encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Jornada'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.JORNADAS, Accion.READ),
  jornadaController.getById.bind(jornadaController),
)

/**
 * @swagger
 * /jornadas/create:
 *   post:
 *     summary: Crear una nueva jornada académica
 *     tags: [Jornadas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Mañana
 *               hora_inicio:
 *                 type: string
 *                 example: "07:00"
 *               hora_fin:
 *                 type: string
 *                 example: "12:30"
 *     responses:
 *       201:
 *         description: Jornada creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Jornada'
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
router.post(
  "/create",
  createJornadaHttpValidator,
  validate,
  validateCreateJornadaDomain,
  checkPermission(Recurso.JORNADAS, Accion.CREATE),
  jornadaController.create.bind(jornadaController),
)

/**
 * @swagger
 * /jornadas/update/{id}:
 *   put:
 *     summary: Actualizar una jornada
 *     tags: [Jornadas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               hora_inicio:
 *                 type: string
 *               hora_fin:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Jornada actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Jornada'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateJornadaHttpValidator,
  validate,
  validateUpdateJornadaDomain,
  checkPermission(Recurso.JORNADAS, Accion.UPDATE),
  jornadaController.update.bind(jornadaController),
)

/**
 * @swagger
 * /jornadas/delete/{id}:
 *   delete:
 *     summary: Eliminar una jornada
 *     tags: [Jornadas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jornada eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.JORNADAS, Accion.DELETE),
  jornadaController.delete.bind(jornadaController),
)

export default router
