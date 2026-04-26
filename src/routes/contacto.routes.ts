import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { ContactoController } from "../controllers/contacto.controller"
import {
  createContactoHttpValidator,
  updateContactoHttpValidator,
  bulkCreateContactoHttpValidator,
  contactoIdValidator,
  personaIdValidator,
} from "../validators/contacto.validators"
import {
  validateCreateContactoDomain,
  validateUpdateContactoDomain,
  validateBulkCreateContactoDomain,
} from "../validators/domain/contacto.domain"
import { validate } from "../middleware/validate"
import { Recurso, Accion } from "../types"

const router = Router()
const contactoController = new ContactoController()

router.use(authenticate)

/**
 * @swagger
 * tags: 
 *  - name: Contactos
 *  description: Rutas o Endpoints para gestionar los contactos de las personas.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contacto:
 *        type: object
 *        propierties:
 *       contacto_id:
 *         type:integer
 *         example: 1
 *       perosna_id:
 *         type:integer
 *         example:1
 *       tipo_contacto:
 *         type:enum
 *         enum: [telefono, email, direccion]
 *         example: "telefono"
 *       valor: 
 *         type:string
 *         example: "300-###-####"
 *       es_principal:
 *         type:boolean
 *         example:true
 *       activo:
 *         type:boolean
 *         example:true
 * 
 *   
 */



/**
 * @swagger
 * 
 * /contactos/getByPersona/{personaId}:
 * get: 
 * 
 *   summary: Obtener los contactos de una persona por ID
 *    tags: [Contactos]
 *    parameters:
 *      - in: path
 *          name: personaId
 *          requered: true
 *        schema:
 *          type: integer
 *         description: ID de la persona
 *       responses:
 *         200:
 *          description: Contactos encontrados
 *            content:
 *              application/json
 *             schema:
 *               type: object
 *              properties:
 *                success: true
 *                type:boolean
 *                example: true
 *               data:
 *                 $ref: '#/components/schemas/Contacto'
 *         401:
 *           $ref: '#/components/responses/Unauthorized'
 *         403:
 *           $ref: '#/components/responses/Forbidden'
 *         404:
 *           $ref: '#/components/responses/NotFound'
 * 
 */


// Obtener contactos por persona
router.get(
  "/getByPersona/:personaId",
  personaIdValidator,
  validate,
  checkPermission(Recurso.PERSONAS, Accion.READ),
  contactoController.getByPersonaId.bind(contactoController)
)

// Obtener contactos por tipo
// router.get(
//   "/getByTipo/:personaId",
//   personaIdValidator,
//   searchContactoValidator,
//   validate,
//   checkPermission(Recurso.PERSONAS, Accion.READ),
//   contactoController.getByTipo.bind(contactoController)
// )

/**
 * @swagger
 *  /contactos/create:
 *    post: 
 *      summary: Crea un contacto de una personana
 *      tags: [Contactos]
 *    requestBody:
 *      requered: true
 *        content:
 *          application/json:
 *            schema:
 * 
 *              $ref: '#/components/schemas/Contacto'
 */
router.post(
  "/create",
  createContactoHttpValidator,
  validate,
  validateCreateContactoDomain,
  checkPermission(Recurso.PERSONAS, Accion.CREATE),
  contactoController.create.bind(contactoController)
)

// Crear múltiples contactos
router.post(
  "/bulkCreate",
  bulkCreateContactoHttpValidator,
  validate,
  validateBulkCreateContactoDomain,
  checkPermission(Recurso.PERSONAS, Accion.CREATE),
  contactoController.bulkCreate.bind(contactoController)
)

// Actualizar contacto
router.put(
  "/update/:id",
  contactoIdValidator,
  updateContactoHttpValidator,
  validate,
  validateUpdateContactoDomain,
  checkPermission(Recurso.PERSONAS, Accion.UPDATE),
  contactoController.update.bind(contactoController)
)

// Establecer como principal
router.patch(
  "/setPrincipal/:id",
  contactoIdValidator,
  validate,
  checkPermission(Recurso.PERSONAS, Accion.UPDATE),
  contactoController.setPrincipal.bind(contactoController)
)

// Eliminar contacto
router.delete(
  "/delete/:id",
  contactoIdValidator,
  validate,
  checkPermission(Recurso.PERSONAS, Accion.DELETE),
  contactoController.delete.bind(contactoController)
)

export default router
