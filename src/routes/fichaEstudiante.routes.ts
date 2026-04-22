import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import {
  FichaEstudianteController,
  ColegioAnteriorController,
  ViviendaEstudianteController,
  ExpedienteController,
} from "../controllers/fichaEstudiante.controller"
import {
  upsertFichaHttpValidator,
  createColegioHttpValidator,
  updateColegioHttpValidator,
  replaceColegiosHttpValidator,
  upsertViviendaHttpValidator,
  upsertExpedienteHttpValidator,
} from "../validators/fichaEstudiante.validators"
import {
  validateUpsertFichaDomain,
  validateCreateColegioDomain,
  validateUpdateColegioDomain,
  validateReplaceColegiosDomain,
  validateUpsertViviendaDomain,
  validateUpsertExpedienteDomain,
} from "../validators/domain/fichaEstudiante.domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

// ─────────────────────────────────────────────────────────────────────────────
// Validator de param reutilizado por todas las rutas de este módulo
// ─────────────────────────────────────────────────────────────────────────────
const estudianteIdParam = param("estudianteId")
  .isInt({ min: 1 })
  .withMessage("estudianteId debe ser un número entero positivo")

const colegioIdParam = param("colegioId")
  .isInt({ min: 1 })
  .withMessage("colegioId debe ser un número entero positivo")

// ─────────────────────────────────────────────────────────────────────────────
// Instancias de controladores
// ─────────────────────────────────────────────────────────────────────────────
const fichaController     = new FichaEstudianteController()
const colegioController   = new ColegioAnteriorController()
const viviendaController  = new ViviendaEstudianteController()
const expedienteController = new ExpedienteController()

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: FichaEstudiante
 *     description: Expediente de caracterización del estudiante (ficha, colegios anteriores, vivienda)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FichaEstudiante:
 *       type: object
 *       properties:
 *         ficha_id:
 *           type: integer
 *           example: 1
 *         estudiante_id:
 *           type: integer
 *           example: 7
 *         estrato:
 *           type: integer
 *           example: 3
 *         eps:
 *           type: string
 *           example: Sura
 *         discapacidad:
 *           type: string
 *           nullable: true
 *
 *     ColegioAnterior:
 *       type: object
 *       properties:
 *         colegio_anterior_id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Colegio San José
 *         grado_cursado:
 *           type: string
 *           example: Quinto
 *         año:
 *           type: integer
 *           example: 2022
 *
 *     ViviendaEstudiante:
 *       type: object
 *       properties:
 *         vivienda_id:
 *           type: integer
 *           example: 1
 *         tipo_vivienda:
 *           type: string
 *           example: Propia
 *         barrio:
 *           type: string
 *           example: El Prado
 *         municipio:
 *           type: string
 *           example: Barranquilla
 */

// =============================================================================
// FICHA ESTUDIANTE
// =============================================================================

/**
 * @swagger
 * /expediente/fichaEstudiante/{estudianteId}:
 *   get:
 *     summary: Obtener la ficha de caracterización de un estudiante
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Ficha encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FichaEstudiante'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/fichaEstudiante/:estudianteId",
  estudianteIdParam,
  validate,
  checkPermission(Recurso.EXPEDIENTE, Accion.READ),
  fichaController.getByEstudiante.bind(fichaController),
)

/**
 * @swagger
 * /expediente/fichaEstudiante/{estudianteId}:
 *   put:
 *     summary: Crear o actualizar la ficha de caracterización de un estudiante (upsert)
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
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
 *               estrato:
 *                 type: integer
 *               eps:
 *                 type: string
 *               discapacidad:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Ficha guardada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FichaEstudiante'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put(
  "/fichaEstudiante/:estudianteId",
  estudianteIdParam,
  upsertFichaHttpValidator,
  validate,
  validateUpsertFichaDomain,
  checkPermission(Recurso.EXPEDIENTE, Accion.UPDATE),
  fichaController.upsert.bind(fichaController),
)

/**
 * @swagger
 * /expediente/fichaEstudiante/{estudianteId}:
 *   delete:
 *     summary: Eliminar la ficha de caracterización de un estudiante
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ficha eliminada exitosamente
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
  "/fichaEstudiante/:estudianteId",
  estudianteIdParam,
  validate,
  checkPermission(Recurso.EXPEDIENTE, Accion.DELETE),
  fichaController.delete.bind(fichaController),
)

// =============================================================================
// COLEGIOS ANTERIORES
// =============================================================================

/**
 * @swagger
 * /expediente/colegiosAnteriores/{estudianteId}:
 *   get:
 *     summary: Obtener los colegios anteriores de un estudiante
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de colegios anteriores
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
 *                     $ref: '#/components/schemas/ColegioAnterior'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/colegiosAnteriores/:estudianteId",
  estudianteIdParam,
  validate,
  checkPermission(Recurso.EXPEDIENTE, Accion.READ),
  colegioController.getByEstudiante.bind(colegioController),
)

/**
 * @swagger
 * /expediente/colegiosAnteriores/{estudianteId}:
 *   post:
 *     summary: Agregar un colegio anterior al historial del estudiante
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, grado_cursado, año]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Colegio San José
 *               grado_cursado:
 *                 type: string
 *                 example: Quinto
 *               año:
 *                 type: integer
 *                 example: 2022
 *     responses:
 *       201:
 *         description: Colegio agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ColegioAnterior'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Agrega un colegio individual
router.post(
  "/colegiosAnteriores/:estudianteId",
  estudianteIdParam,
  createColegioHttpValidator,
  validate,
  validateCreateColegioDomain,
  checkPermission(Recurso.EXPEDIENTE, Accion.CREATE),
  colegioController.create.bind(colegioController),
)

/**
 * @swagger
 * /expediente/colegiosAnteriores/{estudianteId}/replaceAll:
 *   put:
 *     summary: Reemplazar toda la lista de colegios anteriores del estudiante
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [colegios]
 *             properties:
 *               colegios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [nombre, grado_cursado, año]
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     grado_cursado:
 *                       type: string
 *                     año:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Lista de colegios reemplazada exitosamente
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
 *                     $ref: '#/components/schemas/ColegioAnterior'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Reemplaza toda la lista de colegios
router.put(
  "/colegiosAnteriores/:estudianteId/replaceAll",
  estudianteIdParam,
  replaceColegiosHttpValidator,
  validate,
  validateReplaceColegiosDomain,
  checkPermission(Recurso.EXPEDIENTE, Accion.UPDATE),
  colegioController.replaceAll.bind(colegioController),
)

/**
 * @swagger
 * /expediente/colegiosAnteriores/{estudianteId}/{colegioId}:
 *   patch:
 *     summary: Actualizar un colegio anterior individual
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: colegioId
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
 *               grado_cursado:
 *                 type: string
 *               año:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Colegio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ColegioAnterior'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     summary: Eliminar un colegio anterior individual
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: colegioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Colegio eliminado exitosamente
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
// Actualiza un colegio individual
router.patch(
  "/colegiosAnteriores/:estudianteId/:colegioId",
  estudianteIdParam,
  updateColegioHttpValidator,
  validate,
  validateUpdateColegioDomain,
  checkPermission(Recurso.EXPEDIENTE, Accion.UPDATE),
  colegioController.update.bind(colegioController),
)

router.delete(
  "/colegiosAnteriores/:estudianteId/:colegioId",
  estudianteIdParam,
  colegioIdParam,
  validate,
  checkPermission(Recurso.EXPEDIENTE, Accion.DELETE),
  colegioController.delete.bind(colegioController),
)

// =============================================================================
// VIVIENDA ESTUDIANTE
// =============================================================================

/**
 * @swagger
 * /expediente/viviendaEstudiante/{estudianteId}:
 *   get:
 *     summary: Obtener los datos de vivienda del estudiante
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de vivienda encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ViviendaEstudiante'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Crear o actualizar datos de vivienda del estudiante (upsert)
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
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
 *               tipo_vivienda:
 *                 type: string
 *                 example: Propia
 *               barrio:
 *                 type: string
 *               municipio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vivienda guardada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ViviendaEstudiante'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     summary: Eliminar datos de vivienda del estudiante
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vivienda eliminada exitosamente
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
router.get(
  "/viviendaEstudiante/:estudianteId",
  estudianteIdParam,
  validate,
  checkPermission(Recurso.EXPEDIENTE, Accion.READ),
  viviendaController.getByEstudiante.bind(viviendaController),
)

router.put(
  "/viviendaEstudiante/:estudianteId",
  estudianteIdParam,
  upsertViviendaHttpValidator,
  validate,
  validateUpsertViviendaDomain,
  checkPermission(Recurso.EXPEDIENTE, Accion.UPDATE),
  viviendaController.upsert.bind(viviendaController),
)

router.delete(
  "/viviendaEstudiante/:estudianteId",
  estudianteIdParam,
  validate,
  checkPermission(Recurso.EXPEDIENTE, Accion.DELETE),
  viviendaController.delete.bind(viviendaController),
)

// =============================================================================
// EXPEDIENTE COMPLETO
// Agrupa las 3 secciones en un solo endpoint — útil para el formulario
// de caracterización completo que se llena en un solo flujo
// =============================================================================

/**
 * @swagger
 * /expediente/expediente/{estudianteId}:
 *   get:
 *     summary: Obtener el expediente completo del estudiante (ficha + colegios + vivienda)
 *     description: Agrupa las 3 secciones de caracterización en una sola respuesta. Muy útil para cargar el formulario completo.
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expediente completo del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     ficha:
 *                       $ref: '#/components/schemas/FichaEstudiante'
 *                     colegiosAnteriores:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ColegioAnterior'
 *                     vivienda:
 *                       $ref: '#/components/schemas/ViviendaEstudiante'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   put:
 *     summary: Guardar el expediente completo del estudiante en una sola operación (upsert)
 *     tags: [FichaEstudiante]
 *     parameters:
 *       - in: path
 *         name: estudianteId
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
 *               ficha:
 *                 type: object
 *               colegiosAnteriores:
 *                 type: array
 *                 items:
 *                   type: object
 *               vivienda:
 *                 type: object
 *     responses:
 *       200:
 *         description: Expediente guardado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/expediente/:estudianteId",
  estudianteIdParam,
  validate,
  checkPermission(Recurso.EXPEDIENTE, Accion.READ),
  expedienteController.getExpediente.bind(expedienteController),
)

router.put(
  "/expediente/:estudianteId",
  estudianteIdParam,
  upsertExpedienteHttpValidator,
  validate,
  validateUpsertExpedienteDomain,
  checkPermission(Recurso.EXPEDIENTE, Accion.UPDATE),
  expedienteController.upsertExpediente.bind(expedienteController),
)

export default router
