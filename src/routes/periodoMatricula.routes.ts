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
// PERIODOS DE MATRÍCULA
// =============================================================================

// Consultas — cualquier rol autenticado puede ver el estado del período
router.get(
  "/getAll",
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  periodoController.getAll
)

// Endpoint principal que el frontend consulta para saber si el proceso está abierto
router.get(
  "/activo",
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  periodoController.getActivo
)

// Verifica si el período activo sigue dentro de sus fechas
// y lo desactiva automáticamente si venció
router.get(
  "/vigencia",
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  periodoController.verificarVigencia
)

router.get(
  "/getById/:id",
  periodoMatriculaIdValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  periodoController.getById
)

// Mutaciones — solo admin puede gestionar períodos
router.post(
  "/create",
  isAdmin,
  createPeriodoMatriculaHttpValidator,
  validate,
  periodoController.create
)

router.put(
  "/update/:id",
  isAdmin,
  periodoMatriculaIdValidator,
  updatePeriodoMatriculaHttpValidator,
  validate,
  periodoController.update
)

// Activar/desactivar son acciones explícitas separadas del update
// para que quede claro en los logs y en el código qué pasó
router.patch(
  "/activar/:id",
  isAdmin,
  periodoMatriculaIdValidator,
  validate,
  periodoController.activar
)

router.patch(
  "/desactivar/:id",
  isAdmin,
  periodoMatriculaIdValidator,
  validate,
  periodoController.desactivar
)

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

router.get(
  "/matricula/:matriculaId/archivos",
  matriculaIdParamValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  matriculaArchivoController.getByMatricula
)

// Checklist de documentos requeridos — muy usado en el formulario de matrícula
router.get(
  "/matricula/:matriculaId/archivos/requeridos",
  matriculaIdParamValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.READ),
  matriculaArchivoController.getArchivosRequeridos
)

router.post(
  "/matricula/:matriculaId/archivos/asociar",
  asociarArchivoHttpValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.UPDATE),
  matriculaArchivoController.asociar
)

router.post(
  "/matricula/:matriculaId/archivos/asociarBulk",
  asociarArchivosBulkHttpValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.UPDATE),
  matriculaArchivoController.asociarBulk
)

router.delete(
  "/matricula/:matriculaId/archivos/:archivoId",
  desasociarArchivoHttpValidator,
  validate,
  checkPermission(Recurso.MATRICULAS, Accion.UPDATE),
  matriculaArchivoController.desasociar
)

export default router
