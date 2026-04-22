import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { TipoArchivoController } from "../controllers/tipoArchivo.controller"
import {
  createTipoArchivoHttpValidator,
  updateTipoArchivoHttpValidator,
  tipoArchivoIdValidator,
  tipoArchivoNombreValidator,
  tipoArchivoRolValidator,
  checkExtensionValidator,
} from "../validators/tipoArchivo.validators"
import {
  validateCreateTipoArchivoDomain,
  validateUpdateTipoArchivoDomain,
} from "../validators/domain/tipoArchivo.domain"
import { validate } from "../middleware/validate"
import { Recurso, Accion } from "../types"
import { param } from "express-validator"

const router = Router()
const tipoArchivoController = new TipoArchivoController()

router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: TiposArchivo
 *     description: Catálogo de tipos de archivo y sus configuraciones (extensiones permitidas, rol, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoArchivo:
 *       type: object
 *       properties:
 *         tipo_archivo_id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Foto de perfil
 *         rol:
 *           type: string
 *           example: estudiante
 *         extensiones_permitidas:
 *           type: array
 *           items:
 *             type: string
 *           example: ["jpg", "jpeg", "png"]
 *         requerido:
 *           type: boolean
 *           example: true
 *         activo:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /tipos-archivo/getAll:
 *   get:
 *     summary: Listar todos los tipos de archivo
 *     tags: [TiposArchivo]
 *     responses:
 *       200:
 *         description: Lista de tipos de archivo
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
 *                     $ref: '#/components/schemas/TipoArchivo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Obtener todos los tipos de archivo
router.get(
  "/getAll",
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.getAll.bind(tipoArchivoController)
)

/**
 * @swagger
 * /tipos-archivo/getById/{id}:
 *   get:
 *     summary: Obtener un tipo de archivo por ID
 *     tags: [TiposArchivo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de archivo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TipoArchivo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Obtener tipo de archivo por ID
router.get(
  "/getById/:id",
  tipoArchivoIdValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.getById.bind(tipoArchivoController)
)

/**
 * @swagger
 * /tipos-archivo/getByRol/{rol}:
 *   get:
 *     summary: Obtener tipos de archivo por rol de persona
 *     tags: [TiposArchivo]
 *     parameters:
 *       - in: path
 *         name: rol
 *         required: true
 *         schema:
 *           type: string
 *         description: Rol de la persona (ej. estudiante, profesor, administrativo)
 *         example: estudiante
 *     responses:
 *       200:
 *         description: Tipos de archivo para el rol dado
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
 *                     $ref: '#/components/schemas/TipoArchivo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Obtener tipo de archivo por rol de persona
router.get(
  "/getByRol/:rol",
  tipoArchivoRolValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.getRolByTipoArchivo.bind(tipoArchivoController)
)

/**
 * @swagger
 * /tipos-archivo/getByNombre/{nombre}:
 *   get:
 *     summary: Obtener un tipo de archivo por nombre exacto
 *     tags: [TiposArchivo]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del tipo de archivo
 *         example: Foto de perfil
 *     responses:
 *       200:
 *         description: Tipo de archivo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TipoArchivo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Obtener tipo de archivo por nombre
router.get(
  "/getByNombre/:nombre",
  tipoArchivoNombreValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.getByNombre.bind(tipoArchivoController)
)

/**
 * @swagger
 * /tipos-archivo/checkExtension/{id}:
 *   get:
 *     summary: Verificar si una extensión de archivo es permitida para un tipo
 *     tags: [TiposArchivo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de archivo
 *       - in: query
 *         name: extension
 *         required: true
 *         schema:
 *           type: string
 *         description: Extensión a verificar (sin punto)
 *         example: pdf
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 allowed:
 *                   type: boolean
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Verificar si una extensión es permitida
router.get(
  "/checkExtension/:id",
  checkExtensionValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoArchivoController.checkExtension.bind(tipoArchivoController)
)

/**
 * @swagger
 * /tipos-archivo/create:
 *   post:
 *     summary: Crear un nuevo tipo de archivo
 *     tags: [TiposArchivo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, rol]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Acta de nacimiento
 *               rol:
 *                 type: string
 *                 example: estudiante
 *               extensiones_permitidas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["pdf", "jpg"]
 *               requerido:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Tipo de archivo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TipoArchivo'
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
// Crear tipo de archivo
router.post(
  "/create",
  createTipoArchivoHttpValidator,
  validate,
  validateCreateTipoArchivoDomain,
  checkPermission(Recurso.DOCUMENTOS, Accion.CREATE),
  tipoArchivoController.create.bind(tipoArchivoController)
)

/**
 * @swagger
 * /tipos-archivo/update/{id}:
 *   put:
 *     summary: Actualizar un tipo de archivo
 *     tags: [TiposArchivo]
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
 *               extensiones_permitidas:
 *                 type: array
 *                 items:
 *                   type: string
 *               requerido:
 *                 type: boolean
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tipo de archivo actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TipoArchivo'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Actualizar tipo de archivo
router.put(
  "/update/:id",
  tipoArchivoIdValidator,
  updateTipoArchivoHttpValidator,
  validate,
  validateUpdateTipoArchivoDomain,
  checkPermission(Recurso.DOCUMENTOS, Accion.UPDATE),
  tipoArchivoController.update.bind(tipoArchivoController)
)

/**
 * @swagger
 * /tipos-archivo/delete/{id}:
 *   delete:
 *     summary: Eliminar un tipo de archivo
 *     tags: [TiposArchivo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de archivo eliminado
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
// Eliminar tipo de archivo
router.delete(
  "/delete/:id",
  tipoArchivoIdValidator,
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.DELETE),
  tipoArchivoController.delete.bind(tipoArchivoController)
)

export default router
