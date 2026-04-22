import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission, isAdmin } from "../middleware/acl"
import { PeriodoMatriculaController } from "../controllers/periodoMatricula.controller"
import { MatriculaArchivoController } from "../controllers/matriculaArchivo.controller"
import {
  createPeriodoMatriculaHttpValidator,
  updatePeriodoMatriculaHttpValidator,
  periodoMatriculaIdValidator,
  asociarArchivoHttpValidator,
  asociarArchivosBulkHttpValidator,
  desasociarArchivoHttpValidator,
  matriculaIdParamValidator,
} from "../validators/periodoMatricula.validators"
import { validate } from "../middleware/validate"
import { Recurso, Accion } from "../types"

const router = Router()
const periodoController        = new PeriodoMatriculaController()
const matriculaArchivoController = new MatriculaArchivoController()

router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: PeriodosMatricula
 *     description: Gestión de períodos de matrícula y archivos asociados
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PeriodoMatricula:
 *       type: object
 *       properties:
 *         periodo_matricula_id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Matrícula 2025-1
 *         fecha_inicio:
 *           type: string
 *           format: date
 *           example: "2025-01-15"
 *         fecha_fin:
 *           type: string
 *           format: date
 *           example: "2025-02-15"
 *         activo:
 *           type: boolean
 *           example: true
 */

// =============================================================================
// PERIODOS DE MATRÍCULA
// =============================================================================

/**
 * @swagger
 * /periodos-matricula/getAll:
 *   get:
 *     summary: Listar todos los períodos de matrícula
 *     tags: [PeriodosMatricula]
 *     responses:
 *       200:
 *         description: Lista de períodos
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
 *                     $ref: '#/components/schemas/PeriodoMatricula'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Consultas — cualquier rol autenticado puede ver el estado del período
router.get(
  "/getAll",
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  periodoController.getAll
)

/**
 * @swagger
 * /periodos-matricula/activo:
 *   get:
 *     summary: Obtener el período de matrícula activo actual
 *     description: El frontend consulta este endpoint para saber si el proceso de matrícula está abierto.
 *     tags: [PeriodosMatricula]
 *     responses:
 *       200:
 *         description: Período activo o null si no hay ninguno
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/PeriodoMatricula'
 *                     - type: "null"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Endpoint principal que el frontend consulta para saber si el proceso está abierto
router.get(
  "/activo",
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  periodoController.getActivo
)

/**
 * @swagger
 * /periodos-matricula/vigencia:
 *   get:
 *     summary: Verificar si el período activo sigue vigente y desactivarlo si venció
 *     tags: [PeriodosMatricula]
 *     responses:
 *       200:
 *         description: Estado de vigencia verificado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 vigente:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Verifica si el período activo sigue dentro de sus fechas
// y lo desactiva automáticamente si venció
router.get(
  "/vigencia",
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  periodoController.verificarVigencia
)

/**
 * @swagger
 * /periodos-matricula/getById/{id}:
 *   get:
 *     summary: Obtener un período de matrícula por ID
 *     tags: [PeriodosMatricula]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Período encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PeriodoMatricula'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/getById/:id",
  periodoMatriculaIdValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  periodoController.getById
)

/**
 * @swagger
 * /periodos-matricula/create:
 *   post:
 *     summary: Crear un nuevo período de matrícula (solo admin)
 *     tags: [PeriodosMatricula]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, fecha_inicio, fecha_fin]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Matrícula 2025-1
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-15"
 *     responses:
 *       201:
 *         description: Período creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PeriodoMatricula'
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
// Mutaciones — solo admin puede gestionar períodos
router.post(
  "/create",
  isAdmin,
  createPeriodoMatriculaHttpValidator,
  validate,
  periodoController.create
)

/**
 * @swagger
 * /periodos-matricula/update/{id}:
 *   put:
 *     summary: Actualizar un período de matrícula (solo admin)
 *     tags: [PeriodosMatricula]
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
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Período actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PeriodoMatricula'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put(
  "/update/:id",
  isAdmin,
  periodoMatriculaIdValidator,
  updatePeriodoMatriculaHttpValidator,
  validate,
  periodoController.update
)

/**
 * @swagger
 * /periodos-matricula/activar/{id}:
 *   patch:
 *     summary: Activar un período de matrícula (solo admin)
 *     description: Solo puede haber un período activo a la vez. Activar uno desactiva el anterior.
 *     tags: [PeriodosMatricula]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Período activado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PeriodoMatricula'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Activar/desactivar son acciones explícitas separadas del update
// para que quede claro en los logs y en el código qué pasó
router.patch(
  "/activar/:id",
  isAdmin,
  periodoMatriculaIdValidator,
  validate,
  periodoController.activar
)

/**
 * @swagger
 * /periodos-matricula/desactivar/{id}:
 *   patch:
 *     summary: Desactivar un período de matrícula (solo admin)
 *     tags: [PeriodosMatricula]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Período desactivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PeriodoMatricula'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch(
  "/desactivar/:id",
  isAdmin,
  periodoMatriculaIdValidator,
  validate,
  periodoController.desactivar
)

/**
 * @swagger
 * /periodos-matricula/delete/{id}:
 *   delete:
 *     summary: Eliminar un período de matrícula (solo admin)
 *     tags: [PeriodosMatricula]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Período eliminado exitosamente
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
  isAdmin,
  periodoMatriculaIdValidator,
  validate,
  periodoController.delete
)

// =============================================================================
// ARCHIVOS DE MATRÍCULA
// Rutas anidadas bajo /periodos-matricula/matricula/:matriculaId/archivos
// para dejar claro el contexto en la URL
// =============================================================================

/**
 * @swagger
 * /periodos-matricula/matricula/{matriculaId}/archivos:
 *   get:
 *     summary: Obtener los archivos asociados a una matrícula
 *     tags: [PeriodosMatricula]
 *     parameters:
 *       - in: path
 *         name: matriculaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matrícula
 *     responses:
 *       200:
 *         description: Lista de archivos de la matrícula
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
 *                     $ref: '#/components/schemas/Archivo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/matricula/:matriculaId/archivos",
  matriculaIdParamValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  matriculaArchivoController.getByMatricula
)

/**
 * @swagger
 * /periodos-matricula/matricula/{matriculaId}/archivos/requeridos:
 *   get:
 *     summary: Obtener el checklist de documentos requeridos para una matrícula
 *     description: Muy usado en el formulario de matrícula para mostrar qué documentos faltan.
 *     tags: [PeriodosMatricula]
 *     parameters:
 *       - in: path
 *         name: matriculaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Checklist de documentos requeridos
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
 *                       tipo_archivo:
 *                         $ref: '#/components/schemas/TipoArchivo'
 *                       subido:
 *                         type: boolean
 *                       archivo:
 *                         oneOf:
 *                           - $ref: '#/components/schemas/Archivo'
 *                           - type: "null"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Checklist de documentos requeridos — muy usado en el formulario de matrícula
router.get(
  "/matricula/:matriculaId/archivos/requeridos",
  matriculaIdParamValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  matriculaArchivoController.getArchivosRequeridos
)

/**
 * @swagger
 * /periodos-matricula/matricula/{matriculaId}/archivos/asociar:
 *   post:
 *     summary: Asociar un archivo existente a una matrícula
 *     tags: [PeriodosMatricula]
 *     parameters:
 *       - in: path
 *         name: matriculaId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [archivo_id]
 *             properties:
 *               archivo_id:
 *                 type: integer
 *                 example: 12
 *     responses:
 *       201:
 *         description: Archivo asociado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  "/matricula/:matriculaId/archivos/asociar",
  asociarArchivoHttpValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.UPDATE),
  matriculaArchivoController.asociar
)

/**
 * @swagger
 * /periodos-matricula/matricula/{matriculaId}/archivos/asociarBulk:
 *   post:
 *     summary: Asociar múltiples archivos a una matrícula en una sola operación
 *     tags: [PeriodosMatricula]
 *     parameters:
 *       - in: path
 *         name: matriculaId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [archivo_ids]
 *             properties:
 *               archivo_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [12, 13, 14]
 *     responses:
 *       201:
 *         description: Archivos asociados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  "/matricula/:matriculaId/archivos/asociarBulk",
  asociarArchivosBulkHttpValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.UPDATE),
  matriculaArchivoController.asociarBulk
)

/**
 * @swagger
 * /periodos-matricula/matricula/{matriculaId}/archivos/{archivoId}:
 *   delete:
 *     summary: Desasociar un archivo de una matrícula
 *     tags: [PeriodosMatricula]
 *     parameters:
 *       - in: path
 *         name: matriculaId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: archivoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo desasociado exitosamente
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
  "/matricula/:matriculaId/archivos/:archivoId",
  desasociarArchivoHttpValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.UPDATE),
  matriculaArchivoController.desasociar
)

export default router
