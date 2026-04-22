import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { TipoDocumentoController } from "../controllers/tipoDocumento.controller"
import { 
  createTipoDocumentoHttpValidator, 
  updateTipoDocumentoHttpValidator 
} from "../validators/tipoDocumento.validators"
import { 
  validateCreateTipoDocumentoDomain, 
  validateUpdateTipoDocumentoDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"

const router = Router()
const tipoDocumentoController = new TipoDocumentoController()

router.use(authenticate)

// =============================================================================
// SWAGGER
// =============================================================================

/**
 * @swagger
 * tags:
 *   - name: TiposDocumento
 *     description: Catálogo de tipos de documento de identidad (CC, TI, CE, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoDocumentoCompleto:
 *       type: object
 *       properties:
 *         tipo_documento_id:
 *           type: integer
 *           example: 1
 *         tipo_documento:
 *           type: string
 *           example: CC
 *         descripcion:
 *           type: string
 *           example: Cédula de Ciudadanía
 */

/**
 * @swagger
 * /tipos-documento/getAll:
 *   get:
 *     summary: Listar todos los tipos de documento
 *     tags: [TiposDocumento]
 *     responses:
 *       200:
 *         description: Lista de tipos de documento
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
 *                     $ref: '#/components/schemas/TipoDocumentoCompleto'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/getAll",
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoDocumentoController.getAll.bind(tipoDocumentoController),
)

/**
 * @swagger
 * /tipos-documento/getById/{id}:
 *   get:
 *     summary: Obtener un tipo de documento por ID
 *     tags: [TiposDocumento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de documento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TipoDocumentoCompleto'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/getById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.DOCUMENTOS, Accion.READ),
  tipoDocumentoController.getById.bind(tipoDocumentoController),
)

/**
 * @swagger
 * /tipos-documento/create:
 *   post:
 *     summary: Crear un nuevo tipo de documento
 *     tags: [TiposDocumento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo_documento]
 *             properties:
 *               tipo_documento:
 *                 type: string
 *                 example: PASAPORTE
 *               descripcion:
 *                 type: string
 *                 example: Pasaporte internacional
 *     responses:
 *       201:
 *         description: Tipo de documento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TipoDocumentoCompleto'
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
  "/create",
  createTipoDocumentoHttpValidator,
  validate,
  validateCreateTipoDocumentoDomain,
  checkPermission(Recurso.DOCUMENTOS, Accion.CREATE),
  tipoDocumentoController.create.bind(tipoDocumentoController),
)

/**
 * @swagger
 * /tipos-documento/update/{id}:
 *   put:
 *     summary: Actualizar un tipo de documento
 *     tags: [TiposDocumento]
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
 *               tipo_documento:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tipo de documento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TipoDocumentoCompleto'
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
  updateTipoDocumentoHttpValidator,
  validate,
  validateUpdateTipoDocumentoDomain,
  checkPermission(Recurso.DOCUMENTOS, Accion.UPDATE),
  tipoDocumentoController.update.bind(tipoDocumentoController),
)

/**
 * @swagger
 * /tipos-documento/delete/{id}:
 *   delete:
 *     summary: Eliminar un tipo de documento
 *     tags: [TiposDocumento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de documento eliminado
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
  checkPermission(Recurso.DOCUMENTOS, Accion.DELETE),
  tipoDocumentoController.delete.bind(tipoDocumentoController),
)

export default router
