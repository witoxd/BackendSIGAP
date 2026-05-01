import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { MatriculaController } from "../controllers/matricula.controller"
import { 
  createMatriculaHttpValidator, 
  updateMatriculaHttpValidator 
} from "../validators/matricula.validators"
import {
  validateUpdateMatriculaDomain
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"
import { upload, handleMulterError, validateUploadedFiles } from "../config/multer"

const router = Router()
const matriculaController = new MatriculaController()

router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Matrículas
 *     description: Gestión del proceso de matrícula de estudiantes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Matricula:
 *       type: object
 *       properties:
 *         matricula_id:
 *           type: integer
 *           example: 1
 *         estudiante_id:
 *           type: integer
 *           example: 7
 *         curso_id:
 *           type: integer
 *           example: 3
 *         periodo_matricula_id:
 *           type: integer
 *           example: 2
 *         estado:
 *           type: string
 *           enum: [pendiente, aprobada, rechazada]
 *           example: aprobada
 *         fecha_matricula:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /matriculas/getAll:
 *   get:
 *     summary: Listar todas las matrículas con paginación
 *     tags: [Matrículas]
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
 *         description: Lista de matrículas
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
 *                     $ref: '#/components/schemas/Matricula'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/getAll", checkPermission(Recurso.MATRICULAS, Accion.READ), matriculaController.getAll.bind(matriculaController))

/**
 * @swagger
 * /matriculas/getById/{id}:
 *   get:
 *     summary: Obtener una matrícula por ID
 *     tags: [Matrículas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Matrícula encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Matricula'
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
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  matriculaController.getById.bind(matriculaController),
)

router.get(
  "/findMatriculaByEstudiante/estudiante/:estudianteId/Matricula/:matriculaId",
  param("estudianteId", "matriculaId").isInt({min: 1}).withMessage("IDs invalidos"),
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  matriculaController.findMatriculaAndPeriodo.bind(matriculaController)
)
/**
 * @swagger
 * /matriculas/create:
 *   post:
 *     summary: Procesar una nueva matrícula con archivos adjuntos
 *     description: >
 *       Crea la matrícula del estudiante y sube los archivos requeridos en una
 *       sola operación. Los archivos se envían como multipart/form-data bajo
 *       el campo "archivos". Los magic bytes de cada archivo son validados.
 *     tags: [Matrículas]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [estudiante_id, curso_id, periodo_matricula_id]
 *             properties:
 *               estudiante_id:
 *                 type: integer
 *                 example: 7
 *               curso_id:
 *                 type: integer
 *                 example: 3
 *               periodo_matricula_id:
 *                 type: integer
 *                 example: 2
 *               archivos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Archivos requeridos para la matrícula
 *     responses:
 *       201:
 *         description: Matrícula procesada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Matricula'
 *       400:
 *         description: Errores de validación o archivos inválidos
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
  createMatriculaHttpValidator,
  validate,
  upload.array("archivos"),
  handleMulterError,
  validateUploadedFiles, // Validacion de magic bytes
  //validateCreateMatriculaDomain,
  checkPermission(Recurso.MATRICULAS, Accion.CREATE),
  matriculaController.ProcessMatricula.bind(matriculaController),
)

/**
 * @swagger
 * /matriculas/update/{id}:
 *   put:
 *     summary: Actualizar datos de una matrícula
 *     tags: [Matrículas]
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
 *               curso_id:
 *                 type: integer
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aprobada, rechazada]
 *     responses:
 *       200:
 *         description: Matrícula actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Matricula'
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
  updateMatriculaHttpValidator,
  validate,
  validateUpdateMatriculaDomain,
  checkPermission(Recurso.MATRICULAS, Accion.UPDATE),
  matriculaController.update.bind(matriculaController),
)

/**
 * @swagger
 * /matriculas/delete/{id}:
 *   delete:
 *     summary: Eliminar una matrícula
 *     tags: [Matrículas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Matrícula eliminada exitosamente
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
  checkPermission(Recurso.MATRICULAS, Accion.DELETE),
  matriculaController.delete.bind(matriculaController),
)

export default router
