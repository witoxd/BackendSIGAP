import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { AdministrativoController } from "../controllers/administrativo.controller"
import { 
  createAdministrativoHttpValidator, 
  updateAdministrativoHttpValidator 
} from "../validators/administrativo.validators"
import { 
  validateCreateAdministrativoDomain, 
  validateUpdateAdministrativoDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const administrativoController = new AdministrativoController()

router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Administrativos
 *     description: Gestión de personal administrativo y sus datos personales
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdministrativoResumen:
 *       type: object
 *       properties:
 *         administrativo_id:
 *           type: integer
 *           example: 1
 *         cargo:
 *           type: string
 *           example: Secretaria
 *         fecha_vinculacion:
 *           type: string
 *           format: date
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     AdministrativoCompleto:
 *       type: object
 *       properties:
 *         persona:
 *           $ref: '#/components/schemas/PersonaResumen'
 *         administrativo:
 *           $ref: '#/components/schemas/AdministrativoResumen'
 */

/**
 * @swagger
 * /administrativos/getAll:
 *   get:
 *     summary: Listar todo el personal administrativo
 *     tags: [Administrativos]
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
 *         description: Lista de administrativos
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
 *                     $ref: '#/components/schemas/AdministrativoCompleto'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/getAll",
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.READ),
  administrativoController.getAll.bind(administrativoController),
)

/**
 * @swagger
 * /administrativos/getById/{id}:
 *   get:
 *     summary: Obtener un administrativo por ID
 *     tags: [Administrativos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Administrativo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AdministrativoCompleto'
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
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.READ),
  administrativoController.getById.bind(administrativoController),
)

/**
 * @swagger
 * /administrativos/searchIndex/{index}:
 *   get:
 *     summary: Búsqueda full-text de administrativos por nombre o documento
 *     tags: [Administrativos]
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
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
 *                     $ref: '#/components/schemas/AdministrativoCompleto'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/searchIndex/:index",
  param("index").isString().withMessage("Index de busqueda invalido"),
  validate,
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.READ),
  administrativoController.SearchIndex.bind(administrativoController)
)

/**
 * @swagger
 * /administrativos/create:
 *   post:
 *     summary: Crear un administrativo junto con sus datos personales
 *     tags: [Administrativos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [persona, administrativo]
 *             properties:
 *               persona:
 *                 $ref: '#/components/schemas/CreatePersonaBody'
 *               administrativo:
 *                 type: object
 *                 properties:
 *                   cargo:
 *                     type: string
 *                     example: Secretaria
 *                   fecha_vinculacion:
 *                     type: string
 *                     format: date
 *     responses:
 *       201:
 *         description: Administrativo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AdministrativoCompleto'
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
  createAdministrativoHttpValidator,
  validate,
  validateCreateAdministrativoDomain,
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.CREATE),
  administrativoController.create.bind(administrativoController),
)


/**
 * @swagger
 * /administrativos/update/{id}:
 *   put:
 *     summary: Actualizar datos de un administrativo y/o su persona asociada
 *     tags: [Administrativos]
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
 *               persona:
 *                 type: object
 *               administrativo:
 *                 type: object
 *                 properties:
 *                   cargo:
 *                     type: string
 *                   activo:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Administrativo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AdministrativoCompleto'
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
  updateAdministrativoHttpValidator,
  validate,
  validateUpdateAdministrativoDomain,
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.UPDATE),
  administrativoController.update.bind(administrativoController),
)

/**
 * @swagger
 * /administrativos/delete/{id}:
 *   delete:
 *     summary: Eliminar un administrativo y su persona asociada
 *     tags: [Administrativos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Administrativo eliminado exitosamente
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
  checkPermission(Recurso.ADMINISTRATIVOS, Accion.DELETE),
  administrativoController.delete.bind(administrativoController),
)

export default router
