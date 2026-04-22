import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { ArchivoController } from "../controllers/archivo.controller"
import {
  createArchivoHttpValidator,
  updateArchivoHttpValidator,
  bulkCreateArchivoHttpValidator
} from "../validators/archivo.validators"
import {
  validateCreateArchivoDomain,
  validateUpdateArchivoDomain
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param, query } from "express-validator"
import { Recurso, Accion } from "../types"
import { upload, handleMulterError, validateUploadedFiles } from "../config/multer"

const router = Router()
const archivoController = new ArchivoController()

router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: Archivos
 *     description: Gestión de archivos y documentos subidos al sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Archivo:
 *       type: object
 *       properties:
 *         archivo_id:
 *           type: integer
 *           example: 1
 *         persona_id:
 *           type: integer
 *           example: 5
 *         tipo_archivo_id:
 *           type: integer
 *           example: 2
 *         nombre_original:
 *           type: string
 *           example: foto_perfil.jpg
 *         ruta:
 *           type: string
 *           example: uploads/2024/foto_perfil.jpg
 *         mime_type:
 *           type: string
 *           example: image/jpeg
 *         tamaño:
 *           type: integer
 *           example: 204800
 *         activo:
 *           type: boolean
 *           example: true
 *         fecha_subida:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /archivos/getAll:
 *   get:
 *     summary: Listar todos los archivos con paginación
 *     tags: [Archivos]
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
 *         description: Lista de archivos
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
 *                     $ref: '#/components/schemas/Archivo'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Obtener todos los archivos
router.get(
  "/getAll",
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getAll.bind(archivoController)
)

/**
 * @swagger
 * /archivos/getById/{id}:
 *   get:
 *     summary: Obtener un archivo por ID
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Archivo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Obtener archivo por ID
router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getById.bind(archivoController)
)

/**
 * @swagger
 * /archivos/getByPersonaId/{personaId}:
 *   get:
 *     summary: Obtener todos los archivos de una persona
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Archivos de la persona
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
// Obtener archivos por persona
router.get(
  "/getByPersonaId/:personaId",
  param("personaId").isInt({ min: 1 }).withMessage("ID Invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getByPersonaId.bind(archivoController)
)

/**
 * @swagger
 * /archivos/getByTipo:
 *   get:
 *     summary: Obtener archivos filtrados por tipo
 *     tags: [Archivos]
 *     parameters:
 *       - in: query
 *         name: tipo_archivo
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del tipo de archivo
 *         example: Foto de perfil
 *     responses:
 *       200:
 *         description: Archivos del tipo dado
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
 */
// Obtener archivos por tipo
router.get(
  "/getByTipo",
  query("tipo_archivo").notEmpty().withMessage("Tipo de archivo requerido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getByTipo.bind(archivoController)
)

/**
 * @swagger
 * /archivos/download/{id}:
 *   get:
 *     summary: Descargar un archivo como attachment
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo descargado
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Descargar archivo
router.get(
  "/download/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.download.bind(archivoController)
)

/**
 * @swagger
 * /archivos/view/{id}:
 *   get:
 *     summary: Ver un archivo en el navegador (PDFs e imágenes)
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo servido con el Content-Type original
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Ver archivo en navegador (para PDFs e imagenes)
router.get(
  "/view/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.view.bind(archivoController)
)

/**
 * @swagger
 * /archivos/viewPhoto/{personaId}:
 *   get:
 *     summary: Ver la foto de perfil de una persona
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Imagen de perfil
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/viewPhoto/:personaId",
  param("personaId").isInt({min: 1}).withMessage("ID de persona invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  archivoController.getPhotoByPersonaId.bind(archivoController)
)

/**
 * @swagger
 * /archivos/create:
 *   post:
 *     summary: Subir un archivo asociado a una persona
 *     description: >
 *       El archivo se envía como multipart/form-data bajo el campo "archivo".
 *       Los magic bytes del archivo son validados antes de guardarlo.
 *     tags: [Archivos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [persona_id, tipo_archivo_id, archivo]
 *             properties:
 *               persona_id:
 *                 type: integer
 *                 example: 5
 *               tipo_archivo_id:
 *                 type: integer
 *                 example: 2
 *               archivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Archivo'
 *       400:
 *         description: Archivo inválido o errores de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Crear archivo con subida de archivo
// El campo del archivo debe llamarse "archivo" en el form-data
router.post(
  "/create",
  checkPermission(Recurso.DOCUMENTOS, Accion.CREATE),
  upload.single("archivo"), // Middleware de multer para uno o varios archivos
  handleMulterError, // Manejo de errores de multer
  validateUploadedFiles, // Validacion de magic bytes
  createArchivoHttpValidator,
  validate,
  validateCreateArchivoDomain,
  archivoController.create.bind(archivoController)
)

/**
 * @swagger
 * /archivos/bulkCreate:
 *   post:
 *     summary: Subir múltiples archivos para una persona en una sola operación
 *     tags: [Archivos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [persona_id, archivos]
 *             properties:
 *               persona_id:
 *                 type: integer
 *                 example: 5
 *               archivos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               tipos_archivo_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: ID del tipo correspondiente a cada archivo (mismo orden)
 *     responses:
 *       201:
 *         description: Archivos subidos exitosamente
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
 *       400:
 *         description: Archivos inválidos o errores de validación
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
  "/bulkCreate",
  checkPermission(Recurso.DOCUMENTOS, Accion.CREATE),
  upload.array("archivos"), // Middleware de multer para uno o varios archivos
  handleMulterError, // Manejo de errores de multer
  validateUploadedFiles, // Validacion de magic bytes
  bulkCreateArchivoHttpValidator,
  validate,
  validateCreateArchivoDomain,
  archivoController.bulkCreate.bind(archivoController)
)

/**
 * @swagger
 * /archivos/update/{id}:
 *   put:
 *     summary: Actualizar metadatos de un archivo o reemplazarlo con uno nuevo
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_archivo_id:
 *                 type: integer
 *               archivos:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo para reemplazar el existente (opcional)
 *     responses:
 *       200:
 *         description: Archivo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Archivo'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Actualizar archivo (opcionalmente con nuevo archivo)
router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  checkPermission(Recurso.DOCUMENTOS, Accion.UPDATE),
  upload.single("archivos"), // Middleware de multer (opcional)
  handleMulterError,
  validateUploadedFiles, // Validacion de magic bytes
  updateArchivoHttpValidator,
  validate,
  validateUpdateArchivoDomain,
  archivoController.update.bind(archivoController)
)

/**
 * @swagger
 * /archivos/delete/{id}:
 *   delete:
 *     summary: Eliminar un archivo (soft delete — marca como inactivo)
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
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
// Eliminar archivo (soft delete)
router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.DELETE),
  archivoController.delete.bind(archivoController)
)

export default router
