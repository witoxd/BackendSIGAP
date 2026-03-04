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
// FICHA ESTUDIANTE
// =============================================================================

router.get(
  "/fichaEstudiante/:estudianteId",
  estudianteIdParam,
  validate,
  checkPermission(Recurso.EXPEDIENTE, Accion.READ),
  fichaController.getByEstudiante.bind(fichaController),
)

router.put(
  "/fichaEstudiante/:estudianteId",
  estudianteIdParam,
  upsertFichaHttpValidator,
  validate,
  validateUpsertFichaDomain,
  checkPermission(Recurso.EXPEDIENTE, Accion.UPDATE),
  fichaController.upsert.bind(fichaController),
)

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

router.get(
  "/colegiosAnteriores/:estudianteId",
  estudianteIdParam,
  validate,
  checkPermission(Recurso.EXPEDIENTE, Accion.READ),
  colegioController.getByEstudiante.bind(colegioController),
)

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
