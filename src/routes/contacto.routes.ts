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
  searchContactoValidator,
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

// Obtener todos los contactos
router.get(
  "/getAll",
  checkPermission(Recurso.PERSONAS, Accion.READ),
  contactoController.getAll.bind(contactoController)
)

// Obtener contacto por ID
router.get(
  "/getById/:id",
  contactoIdValidator,
  validate,
  checkPermission(Recurso.PERSONAS, Accion.READ),
  contactoController.getById.bind(contactoController)
)

// Obtener contactos por persona
router.get(
  "/getByPersona/:personaId",
  personaIdValidator,
  validate,
  checkPermission(Recurso.PERSONAS, Accion.READ),
  contactoController.getByPersonaId.bind(contactoController)
)

// Obtener contactos por tipo
router.get(
  "/getByTipo/:personaId",
  personaIdValidator,
  searchContactoValidator,
  validate,
  checkPermission(Recurso.PERSONAS, Accion.READ),
  contactoController.getByTipo.bind(contactoController)
)

// Crear contacto
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
