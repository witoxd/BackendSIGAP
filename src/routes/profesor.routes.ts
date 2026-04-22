import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { ProfesorController } from "../controllers/profesor.controller"
import { 
  createProfesorHttpValidator, 
  updateProfesorHttpValidator 
} from "../validators/profesor.validators"
import { 
  validateCreateProfesorDomain, 
  validateUpdateProfesorDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const profesorController = new ProfesorController()

router.use(authenticate)

// =============================================================================
// SWAGGER — Definición del tag y schemas locales
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Profesores
 *     description: Gestión de profesores y sus datos personales asociados
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProfesorResumen:
 *       type: object
 *       properties:
 *         profesor_id:
 *           type: integer
 *           example: 1
 *         fecha_vinculacion:
 *           type: string
 *           format: date
 *           example: "2020-02-01"
 *         especialidad:
 *           type: string
 *           example: Matemáticas
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     ProfesorCompleto:
 *       type: object
 *       properties:
 *         persona:
 *           $ref: '#/components/schemas/PersonaResumen'
 *         profesor:
 *           $ref: '#/components/schemas/ProfesorResumen'
 */

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * @swagger
 * /profesores/getAll:
 *   get:
 *     summary: Listar todos los profesores con paginación
 *     tags: [Profesores]
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
 *         description: Lista de profesores
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
 *                     $ref: '#/components/schemas/ProfesorCompleto'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/getAll", checkPermission(Recurso.PROFESORES, Accion.READ), profesorController.getAll.bind(profesorController))

/**
 * @swagger
 * /profesores/getById/{id}:
 *   get:
 *     summary: Obtener un profesor por ID
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesor
 *     responses:
 *       200:
 *         description: Profesor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProfesorCompleto'
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
  checkPermission(Recurso.PROFESORES, Accion.READ),
  profesorController.getById.bind(profesorController),
)

/**
 * @swagger
 * /profesores/searchIndex/{index}:
 *   get:
 *     summary: Búsqueda full-text de profesores por nombre o documento
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *         example: García
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
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
 *                     $ref: '#/components/schemas/ProfesorCompleto'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/searchIndex/:index",
  param("index").isString().withMessage("Index de busqueda invalido"),
  validate,
  checkPermission(Recurso.PROFESORES, Accion.READ),
  profesorController.SearchIndex.bind(profesorController),
)

/**
 * @swagger
 * /profesores/create:
 *   post:
 *     summary: Crear un profesor junto con sus datos personales
 *     tags: [Profesores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [persona, profesor]
 *             properties:
 *               persona:
 *                 $ref: '#/components/schemas/CreatePersonaBody'
 *               profesor:
 *                 type: object
 *                 properties:
 *                   fecha_vinculacion:
 *                     type: string
 *                     format: date
 *                   especialidad:
 *                     type: string
 *     responses:
 *       201:
 *         description: Profesor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProfesorCompleto'
 *       400:
 *         description: Errores de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe una persona con ese número de documento
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
  createProfesorHttpValidator,
  validate,
  validateCreateProfesorDomain,
  checkPermission(Recurso.PROFESORES, Accion.CREATE),
  profesorController.create.bind(profesorController),
)


/**
 * @swagger
 * /profesores/update/{id}:
 *   put:
 *     summary: Actualizar datos de un profesor y/o su persona asociada
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Todos los campos son opcionales
 *             properties:
 *               persona:
 *                 type: object
 *               profesor:
 *                 type: object
 *                 properties:
 *                   especialidad:
 *                     type: string
 *                   activo:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Profesor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProfesorCompleto'
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
  updateProfesorHttpValidator,
  validate,
  validateUpdateProfesorDomain,
  checkPermission(Recurso.PROFESORES, Accion.UPDATE),
  profesorController.update.bind(profesorController),
)

/**
 * @swagger
 * /profesores/delete/{id}:
 *   delete:
 *     summary: Eliminar un profesor y su persona asociada
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesor a eliminar
 *     responses:
 *       200:
 *         description: Profesor eliminado exitosamente
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
  checkPermission(Recurso.PROFESORES, Accion.DELETE),
  profesorController.delete.bind(profesorController),
)

export default router
