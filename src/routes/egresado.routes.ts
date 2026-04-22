import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { EgresadoController } from "../controllers/egresado.controller"
import { 
  createEgresadoHttpValidator, 
  updateEgresadoHttpValidator 
} from "../validators/egresado.validators"
import { 
  validateCreateEgresadoDomain, 
  validateUpdateEgresadoDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const egresadoController = new EgresadoController()

router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Egresados
 *     description: Gestión de estudiantes egresados
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EgresadoResumen:
 *       type: object
 *       properties:
 *         egresado_id:
 *           type: integer
 *           example: 1
 *         estudiante_id:
 *           type: integer
 *           example: 42
 *         año_egreso:
 *           type: integer
 *           example: 2023
 *         titulo_obtenido:
 *           type: string
 *           example: Bachiller Académico
 *
 *     EgresadoCompleto:
 *       type: object
 *       properties:
 *         persona:
 *           $ref: '#/components/schemas/PersonaResumen'
 *         estudiante:
 *           $ref: '#/components/schemas/EstudianteResumen'
 *         egresado:
 *           $ref: '#/components/schemas/EgresadoResumen'
 */

/**
 * @swagger
 * /egresados/getAll:
 *   get:
 *     summary: Listar todos los egresados
 *     tags: [Egresados]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Lista de egresados
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
 *                     $ref: '#/components/schemas/EgresadoCompleto'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/getAll", checkPermission(Recurso.ESTUDIANTES, Accion.READ), egresadoController.getAll.bind(egresadoController))

/**
 * @swagger
 * /egresados/getById/{id}:
 *   get:
 *     summary: Obtener un egresado por ID
 *     tags: [Egresados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Egresado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EgresadoCompleto'
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
  checkPermission(Recurso.ESTUDIANTES, Accion.READ),
  egresadoController.getById.bind(egresadoController),
)

/**
 * @swagger
 * /egresados/create:
 *   post:
 *     summary: Registrar un estudiante como egresado
 *     tags: [Egresados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estudiante_id, año_egreso]
 *             properties:
 *               estudiante_id:
 *                 type: integer
 *                 example: 42
 *               año_egreso:
 *                 type: integer
 *                 example: 2023
 *               titulo_obtenido:
 *                 type: string
 *                 example: Bachiller Académico
 *     responses:
 *       201:
 *         description: Egresado registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EgresadoCompleto'
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
  createEgresadoHttpValidator,
  validate,
  validateCreateEgresadoDomain,
  checkPermission(Recurso.ESTUDIANTES, Accion.CREATE),
  egresadoController.create.bind(egresadoController),
)

/**
 * @swagger
 * /egresados/update/{id}:
 *   put:
 *     summary: Actualizar datos de un egresado
 *     tags: [Egresados]
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
 *               año_egreso:
 *                 type: integer
 *               titulo_obtenido:
 *                 type: string
 *     responses:
 *       200:
 *         description: Egresado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EgresadoCompleto'
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
  updateEgresadoHttpValidator,
  validate,
  validateUpdateEgresadoDomain,
  checkPermission(Recurso.ESTUDIANTES, Accion.UPDATE),
  egresadoController.update.bind(egresadoController),
)

/**
 * @swagger
 * /egresados/delete/{id}:
 *   delete:
 *     summary: Eliminar un registro de egresado
 *     tags: [Egresados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Egresado eliminado exitosamente
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
  checkPermission(Recurso.ESTUDIANTES, Accion.DELETE),
  egresadoController.delete.bind(egresadoController),
)

export default router
