import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { checkPermission } from "../middleware/acl"
import { PersonaController } from "../controllers/persona.controller"
import { 
  createPersonaHttpValidator, 
  updatePersonaHttpValidator 
} from "../validators/persona.validators"
import { 
  validateCreatePersonaDomain, 
  validateUpdatePersonaDomain 
} from "../validators/domain"
import { validate } from "../middleware/validate"
import { param } from "express-validator"
import { Recurso, Accion } from "../types"


const router = Router()
const personaController = new PersonaController()

router.use(authenticate)

router.get("/getAll", checkPermission(Recurso.PERSONAS, Accion.READ), personaController.getAll.bind(personaController))

router.get(
  "/findById/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.PERSONAS, Accion.READ),
  personaController.getById.bind(personaController),
)

router.post(
  "/create",
  createPersonaHttpValidator,
  validate,
  validateCreatePersonaDomain,
  checkPermission(Recurso.PERSONAS, Accion.CREATE),
  personaController.create.bind(personaController),
)

router.put(
  "/update/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  updatePersonaHttpValidator,
  validate,
  validateUpdatePersonaDomain,
  checkPermission(Recurso.PERSONAS, Accion.UPDATE),
  personaController.update.bind(personaController),
)

router.delete(
  "/delete/:id",
  param("id").isInt({ min: 1 }).withMessage("ID invalido"),
  validate,
  checkPermission(Recurso.PERSONAS, Accion.DELETE),
  personaController.delete.bind(personaController),
)

router.get(
 "/getByDocumento/:numero_documento",
   param("numero_documento").isString().withMessage("Documento invalido"),
 validate,
 checkPermission(Recurso.PERSONAS, Accion.READ),
 personaController.getByDocumento.bind(personaController),
)

router.get(
  "/searchIndex/:index",
  param("index").isString().withMessage("Index de busqueda invalido"),
  validate,
  checkPermission(Recurso.PERSONAS, Accion.READ),
  personaController.SearchIndex.bind(personaController)
)

router.get(
  "/searchByDocumento/:numero_documento",
    param("numero_documento").isString().withMessage("Index de busqueda invalido"),
    validate,
      checkPermission(Recurso.PERSONAS, Accion.READ),
      personaController.searchByDocumento.bind(personaController)
)

export default router
