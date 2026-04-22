import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { EstudianteController } from "../controllers/estudiante.controller"
import {
  createEstudianteHttpValidator,
  updateEstudianteHttpValidator
} from "../validators/estudiante.validators"
import {
  validateCreateEstudianteDomain,
  validateUpdateEstudianteDomain
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const estudianteController = new EstudianteController()

router.use(authenticate)

// =============================================================================
// SWAGGER — Definición del tag y schemas locales
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Estudiantes
 *     description: Gestión de estudiantes y sus datos personales asociados
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoDocumento:
 *       type: object
 *       properties:
 *         tipo_documento_id:
 *           type: integer
 *           example: 1
 *         tipo_documento:
 *           type: string
 *           example: CC
 *
 *     PersonaResumen:
 *       type: object
 *       properties:
 *         persona_id:
 *           type: integer
 *           example: 1
 *         nombres:
 *           type: string
 *           example: Carlos
 *         apellido_paterno:
 *           type: string
 *           example: Gómez
 *         apellido_materno:
 *           type: string
 *           example: Ruiz
 *         numero_documento:
 *           type: string
 *           example: "1020304050"
 *         genero:
 *           type: string
 *           enum: [M, F]
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "2010-05-15"
 *         tipo_sangre:
 *           type: string
 *           example: O+
 *         tipo_documento:
 *           $ref: '#/components/schemas/TipoDocumento'
 *
 *     EstudianteResumen:
 *       type: object
 *       properties:
 *         estudiante_id:
 *           type: integer
 *           example: 1
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *           example: "2023-01-15"
 *         estado:
 *           type: string
 *           enum: [activo, inactivo, egresado, retirado]
 *           example: activo
 *
 *     EstudianteCompleto:
 *       type: object
 *       description: Respuesta combinada con datos de persona y estudiante
 *       properties:
 *         persona:
 *           $ref: '#/components/schemas/PersonaResumen'
 *         estudiante:
 *           $ref: '#/components/schemas/EstudianteResumen'
 *
 *     CreateEstudianteBody:
 *       type: object
 *       required: [persona, estudiante]
 *       properties:
 *         persona:
 *           type: object
 *           required: [nombres, apellido_paterno, numero_documento, tipo_documento_id, genero, fecha_nacimiento]
 *           properties:
 *             nombres:
 *               type: string
 *               example: Carlos
 *             apellido_paterno:
 *               type: string
 *               example: Gómez
 *             apellido_materno:
 *               type: string
 *               example: Ruiz
 *             numero_documento:
 *               type: string
 *               example: "1020304050"
 *             tipo_documento_id:
 *               type: integer
 *               example: 1
 *             genero:
 *               type: string
 *               enum: [M, F]
 *             fecha_nacimiento:
 *               type: string
 *               format: date
 *               example: "2010-05-15"
 *             tipo_sangre:
 *               type: string
 *               example: O+
 *         estudiante:
 *           type: object
 *           properties:
 *             fecha_ingreso:
 *               type: string
 *               format: date
 *               example: "2024-03-01"
 *             estado:
 *               type: string
 *               enum: [activo, inactivo, egresado, retirado]
 *               default: activo
 *
 *     UpdateEstudianteBody:
 *       type: object
 *       description: Todos los campos son opcionales — solo se actualizan los enviados
 *       properties:
 *         persona:
 *           type: object
 *           properties:
 *             nombres:
 *               type: string
 *             apellido_paterno:
 *               type: string
 *             apellido_materno:
 *               type: string
 *             numero_documento:
 *               type: string
 *             tipo_sangre:
 *               type: string
 *         estudiante:
 *           type: object
 *           properties:
 *             estado:
 *               type: string
 *               enum: [activo, inactivo, egresado, retirado]
 */

// =============================================================================
// ENDPOINTS
// =============================================================================

/**
 * @swagger
 * /estudiantes/getAll/(limit, offset):
 *   get:
 *     summary: Listar todos los estudiantes con paginación
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de registros a saltar
 *     responses:
 *       200:
 *         description: Lista de estudiantes
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
 *                     $ref: '#/components/schemas/EstudianteCompleto'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/getAll",
  checkPermission(Recurso.ESTUDIANTES, Accion.READ),
  estudianteController.getAll.bind(estudianteController),
)

/**
 * @swagger
 * /estudiantes/getById/{id}:
 *   get:
 *     summary: Obtener un estudiante por ID
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Estudiante encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EstudianteCompleto'
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
  estudianteController.getById.bind(estudianteController),
)

/**
 * @swagger
 * /estudiantes/getByDocumento/{numero_documento}:
 *   get:
 *     summary: Buscar un estudiante por número de documento
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: numero_documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento de identidad
 *         example: "1020304050"
 *     responses:
 *       200:
 *         description: Estudiante encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EstudianteCompleto'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/getByDocumento/:numero_documento",
  param("numero_documento").isString().withMessage("Documento invalido"),
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.READ),
  estudianteController.getByDocumento.bind(estudianteController)
)

/**
 * @swagger
 * /estudiantes/searchIndex/{index}:
 *   get:
 *     summary: Búsqueda full-text de estudiantes por nombre o documento
 *     description: >
 *       Si el término es numérico busca por número de documento (ILIKE).
 *       Si contiene letras busca por nombre/apellido usando índice full-text (tsvector).
 *       Términos de menos de 4 caracteres usan ILIKE como fallback.
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, apellido o número de documento)
 *         example: Carlos Gómez
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Resultados de búsqueda ordenados por relevancia
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/searchIndex/:index",
  param("index").isString().withMessage("Index de busqueda invalido"),
  validate,
  checkPermission(Recurso.ESTUDIANTES, Accion.READ),
  estudianteController.SearchIndex.bind(estudianteController)
)

/**
 * @swagger
 * /estudiantes/{id}/acudientes:
 *   get:
 *     summary: Obtener los acudientes asignados a un estudiante
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Lista de acudientes del estudiante
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
 *                       relacion:
 *                         type: object
 *                         properties:
 *                           acudiente_estudiante_id:
 *                             type: integer
 *                           tipo_relacion:
 *                             type: string
 *                             example: madre
 *                           es_principal:
 *                             type: boolean
 *                       estudiante:
 *                         $ref: '#/components/schemas/EstudianteCompleto'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/:id/acudientes",
  param("id").isInt({ min: 1 }).withMessage("ID de estudiante invalido"),
  validate,
  checkPermission(Recurso.ACUDIENTES, Accion.READ),
  estudianteController.getEstudiantesByAcudiente.bind(estudianteController),
)

/**
 * @swagger
 * /estudiantes/create:
 *   post:
 *     summary: Crear un estudiante junto con sus datos personales
 *     description: >
 *       Crea la persona y el estudiante en una sola transacción atómica.
 *       Si cualquier parte falla, ningún registro se guarda.
 *     tags: [Estudiantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEstudianteBody'
 *     responses:
 *       201:
 *         description: Estudiante creado exitosamente
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
 *                   example: Estudiante creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/EstudianteCompleto'
 *       400:
 *         description: Errores de validación en los datos enviados
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
  createEstudianteHttpValidator,
  validate,
  validateCreateEstudianteDomain,
  checkPermission(Recurso.ESTUDIANTES, Accion.CREATE),
  estudianteController.create.bind(estudianteController),
)

/**
 * @swagger
 * /estudiantes/update/{id}:
 *   put:
 *     summary: Actualizar datos de un estudiante y/o su persona asociada
 *     description: >
 *       Todos los campos son opcionales. Solo se actualizan los campos enviados.
 *       Si se envía `persona`, actualiza los datos personales.
 *       Si se envía `estudiante`, actualiza los datos académicos.
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEstudianteBody'
 *     responses:
 *       200:
 *         description: Estudiante actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EstudianteCompleto'
 *       400:
 *         description: Errores de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: El número de documento ya está en uso por otra persona
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updateEstudianteHttpValidator,
  validate,
  validateUpdateEstudianteDomain,
  checkPermission(Recurso.ESTUDIANTES, Accion.UPDATE),
  estudianteController.update.bind(estudianteController),
)

/**
 * @swagger
 * /estudiantes/delete/{id}:
 *   delete:
 *     summary: Eliminar un estudiante y su persona asociada
 *     description: >
 *       Elimina permanentemente el registro del estudiante y la persona vinculada.
 *       Esta operación no es reversible.
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante a eliminar
 *     responses:
 *       200:
 *         description: Estudiante eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Estudiante eliminado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     estudiante:
 *                       $ref: '#/components/schemas/EstudianteResumen'
 *                     persona:
 *                       $ref: '#/components/schemas/PersonaResumen'
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
  estudianteController.delete.bind(estudianteController),
)

export default router
