import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { PersonaController } from "../controllers/persona.controller"
import { 
  createPersonaHttpValidator, 
  updatePersonaHttpValidator 
} from "../validators/persona.validators"
import { 
  validateCreatePersonaDomain, 
  validateUpdatePersonaDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"


const router = Router()
const personaController = new PersonaController()

router.use(authenticate)

// =============================================================================
// SWAGGER — Definición del tag y schemas locales
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Personas
 *     description: Gestión de personas (base de datos maestra de individuos)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePersonaBody:
 *       type: object
 *       required: [nombres, apellido_paterno, numero_documento, tipo_documento_id, genero, fecha_nacimiento]
 *       properties:
 *         nombres:
 *           type: string
 *           example: Ana
 *         apellido_paterno:
 *           type: string
 *           example: Rodríguez
 *         apellido_materno:
 *           type: string
 *           example: Silva
 *         numero_documento:
 *           type: string
 *           example: "1030405060"
 *         tipo_documento_id:
 *           type: integer
 *           example: 1
 *         genero:
 *           type: string
 *           enum: [M, F]
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "1990-08-14"
 *         tipo_sangre:
 *           type: string
 *           example: A+
 */

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * @swagger
 * /personas/getAll:
 *   get:
 *     summary: Listar todas las personas con paginación
 *     tags: [Personas]
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
 *         description: Lista de personas
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
 *                     $ref: '#/components/schemas/PersonaResumen'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/getAll", checkPermission(Recurso.PERSONAS, Accion.READ), personaController.getAll.bind(personaController))

/**
 * @swagger
 * /personas/findById/{id}:
 *   get:
 *     summary: Obtener una persona por ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Persona encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PersonaResumen'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/findById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.PERSONAS, Accion.READ),
  personaController.getById.bind(personaController),
)

/**
 * @swagger
 * /personas/create:
 *   post:
 *     summary: Crear una nueva persona
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePersonaBody'
 *     responses:
 *       201:
 *         description: Persona creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PersonaResumen'
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
  createPersonaHttpValidator,
  validate,
  validateCreatePersonaDomain,
  checkPermission(Recurso.PERSONAS, Accion.CREATE),
  personaController.create.bind(personaController),
)

/**
 * @swagger
 * /personas/update/{id}:
 *   put:
 *     summary: Actualizar datos de una persona
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Todos los campos son opcionales
 *             properties:
 *               nombres:
 *                 type: string
 *               apellido_paterno:
 *                 type: string
 *               apellido_materno:
 *                 type: string
 *               numero_documento:
 *                 type: string
 *               tipo_sangre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Persona actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PersonaResumen'
 *       400:
 *         description: Errores de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
  updatePersonaHttpValidator,
  validate,
  validateUpdatePersonaDomain,
  checkPermission(Recurso.PERSONAS, Accion.UPDATE),
  personaController.update.bind(personaController),
)

/**
 * @swagger
 * /personas/delete/{id}:
 *   delete:
 *     summary: Eliminar una persona
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona a eliminar
 *     responses:
 *       200:
 *         description: Persona eliminada exitosamente
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
  checkPermission(Recurso.PERSONAS, Accion.DELETE),
  personaController.delete.bind(personaController),
)

/**
 * @swagger
 * /personas/getByDocumento/{numero_documento}:
 *   get:
 *     summary: Buscar una persona por número de documento
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento de identidad
 *         example: "1030405060"
 *     responses:
 *       200:
 *         description: Persona encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PersonaResumen'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
 "/getByDocumento/:numero_documento",
   param("numero_documento").isString().withMessage("Documento invalido"),
 validate,
 checkPermission(Recurso.PERSONAS, Accion.READ),
 personaController.getByDocumento.bind(personaController),
)

/**
 * @swagger
 * /personas/searchIndex/{index}:
 *   get:
 *     summary: Búsqueda full-text de personas por nombre o documento
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, apellido o número de documento)
 *         example: Ana Rodríguez
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
 *                     $ref: '#/components/schemas/PersonaResumen'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/searchIndex/:index",
  param("index").isString().withMessage("Index de busqueda invalido"),
  validate,
  checkPermission(Recurso.PERSONAS, Accion.READ),
  personaController.SearchIndex.bind(personaController)
)

/**
 * @swagger
 * /personas/searchByDocumento/{numero_documento}:
 *   get:
 *     summary: Búsqueda de persona por fragmento de número de documento (ILIKE)
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Fragmento del número de documento
 *         example: "103040"
 *     responses:
 *       200:
 *         description: Personas encontradas
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
 *                     $ref: '#/components/schemas/PersonaResumen'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/searchByDocumento/:numero_documento",
    param("numero_documento").isString().withMessage("Index de busqueda invalido"),
    validate,
      checkPermission(Recurso.PERSONAS, Accion.READ),
      personaController.searchByDocumento.bind(personaController)
)

export default router
