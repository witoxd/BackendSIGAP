import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { AcudienteController } from "../controllers/acudiente.controller"
import { 
  createAcudienteHttpValidator, 
  updateAcudienteHttpValidator,
  assignAcudienteHttpValidator,
  removeEstudianteToAcudienteHttpValidator
} from "../validators/acudiente.validators"
import { 
  validateCreateAcudienteDomain, 
  validateUpdateAcudienteDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const acudienteController = new AcudienteController()

router.use(authenticate)

// =============================================================================
// SWAGGER — Definición del tag y schemas locales
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Acudientes
 *     description: Gestión de acudientes y su vinculación con estudiantes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AcudienteResumen:
 *       type: object
 *       properties:
 *         acudiente_id:
 *           type: integer
 *           example: 1
 *         fecha_registro:
 *           type: string
 *           format: date
 *           example: "2024-01-10"
 *         ocupacion:
 *           type: string
 *           example: Ingeniero
 *
 *     AcudienteCompleto:
 *       type: object
 *       properties:
 *         persona:
 *           $ref: '#/components/schemas/PersonaResumen'
 *         acudiente:
 *           $ref: '#/components/schemas/AcudienteResumen'
 *
 *     CreateAcudienteBody:
 *       type: object
 *       required: [persona, acudiente]
 *       properties:
 *         persona:
 *           type: object
 *           required: [nombres, apellido_paterno, numero_documento, tipo_documento_id, genero, fecha_nacimiento]
 *           properties:
 *             nombres:
 *               type: string
 *               example: María
 *             apellido_paterno:
 *               type: string
 *               example: López
 *             apellido_materno:
 *               type: string
 *               example: Torres
 *             numero_documento:
 *               type: string
 *               example: "52123456"
 *             tipo_documento_id:
 *               type: integer
 *               example: 1
 *             genero:
 *               type: string
 *               enum: [M, F]
 *             fecha_nacimiento:
 *               type: string
 *               format: date
 *               example: "1985-03-22"
 *         acudiente:
 *           type: object
 *           properties:
 *             ocupacion:
 *               type: string
 *               example: Docente
 *
 *     AssignAcudienteBody:
 *       type: object
 *       required: [acudiente_id, estudiante_id, tipo_relacion]
 *       properties:
 *         acudiente_id:
 *           type: integer
 *           example: 3
 *         estudiante_id:
 *           type: integer
 *           example: 7
 *         tipo_relacion:
 *           type: string
 *           example: madre
 *         es_principal:
 *           type: boolean
 *           default: false
 */

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * @swagger
 * /acudientes/getAll:
 *   get:
 *     summary: Listar todos los acudientes con paginación
 *     tags: [Acudientes]
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
 *         description: Lista de acudientes
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
 *                     $ref: '#/components/schemas/AcudienteCompleto'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/getAll", checkPermission(Recurso.ACUDIENTES, Accion.READ), acudienteController.getAll.bind(acudienteController))

/**
 * @swagger
 * /acudientes/getById/{id}:
 *   get:
 *     summary: Obtener un acudiente por ID
 *     tags: [Acudientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del acudiente
 *     responses:
 *       200:
 *         description: Acudiente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AcudienteCompleto'
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
  checkPermission(Recurso.ACUDIENTES, Accion.READ),
  acudienteController.getById.bind(acudienteController),
)

/**
 * @swagger
 * /acudientes/searchIndex/{index}:
 *   get:
 *     summary: Búsqueda full-text de acudientes por nombre o documento
 *     tags: [Acudientes]
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, apellido o número de documento)
 *         example: María López
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
 *                     $ref: '#/components/schemas/AcudienteCompleto'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/searchIndex/:index",
  param("index").isString().withMessage("Index de busqueda invalido"),
  validate,
  checkPermission(Recurso.ACUDIENTES, Accion.READ),
  acudienteController.SearchIndex.bind(acudienteController)
)

/**
 * @swagger
 * /acudientes/{id}/estudiantes:
 *   get:
 *     summary: Obtener los estudiantes vinculados a un acudiente
 *     tags: [Acudientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del acudiente
 *     responses:
 *       200:
 *         description: Lista de estudiantes del acudiente
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
 *                     $ref: '#/components/schemas/EstudianteCompleto'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/:id/estudiantes",
  param("id").isInt({ min: 1 }).withMessage("ID de estudiante invalido"),
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.READ),
  acudienteController.getAcudientesByEstudiante.bind(acudienteController),
)

/**
 * @swagger
 * /acudientes/create:
 *   post:
 *     summary: Crear un acudiente junto con sus datos personales
 *     tags: [Acudientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAcudienteBody'
 *     responses:
 *       201:
 *         description: Acudiente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AcudienteCompleto'
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
  createAcudienteHttpValidator,
  validate,
  validateCreateAcudienteDomain,
  checkPermission(Recurso.ACUDIENTES, Accion.CREATE),
  acudienteController.create.bind(acudienteController),
)


/**
 * @swagger
 * /acudientes/update/{id}:
 *   put:
 *     summary: Actualizar datos de un acudiente y/o su persona asociada
 *     tags: [Acudientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del acudiente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona:
 *                 type: object
 *                 properties:
 *                   nombres:
 *                     type: string
 *                   apellido_paterno:
 *                     type: string
 *                   apellido_materno:
 *                     type: string
 *                   numero_documento:
 *                     type: string
 *               acudiente:
 *                 type: object
 *                 properties:
 *                   ocupacion:
 *                     type: string
 *     responses:
 *       200:
 *         description: Acudiente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AcudienteCompleto'
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
  updateAcudienteHttpValidator,
  validate,
  validateUpdateAcudienteDomain,
  checkPermission(Recurso.ACUDIENTES, Accion.UPDATE),
  acudienteController.update.bind(acudienteController),
)

/**
 * @swagger
 * /acudientes/delete/{id}:
 *   delete:
 *     summary: Eliminar un acudiente y su persona asociada
 *     tags: [Acudientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del acudiente a eliminar
 *     responses:
 *       200:
 *         description: Acudiente eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Acudiente eliminado exitosamente
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
  checkPermission(Recurso.ACUDIENTES, Accion.DELETE),
  acudienteController.delete.bind(acudienteController),
)

/**
 * @swagger
 * /acudientes/assignToEstudiante:
 *   post:
 *     summary: Vincular un acudiente existente a un estudiante
 *     tags: [Acudientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignAcudienteBody'
 *     responses:
 *       201:
 *         description: Acudiente vinculado al estudiante exitosamente
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
router.post(
  "/assignToEstudiante",
  assignAcudienteHttpValidator,
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.CREATE),
  acudienteController.assignToEstudiante.bind(acudienteController)
)

/**
 * @swagger
 * /acudientes/removeFromEstudiante/estudiante/{estudianteId}/acudiente/{acudienteId}:
 *   patch:
 *     summary: Desvincular un acudiente de un estudiante
 *     tags: [Acudientes]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *       - in: path
 *         name: acudienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del acudiente
 *     responses:
 *       200:
 *         description: Acudiente desvinculado del estudiante
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
router.patch(
  "/removeFromEstudiante/estudiante/:estudianteId/acudiente/:acudienteId",
  removeEstudianteToAcudienteHttpValidator,
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.DELETE),
  acudienteController.removeFromEstudiante.bind(acudienteController)
)

export default router
