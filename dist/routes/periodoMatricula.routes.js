"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const acl_1 = require("../middleware/acl");
const periodoMatricula_controller_1 = require("../controllers/periodoMatricula.controller");
const matriculaArchivo_controller_1 = require("../controllers/matriculaArchivo.controller");
const periodoMatricula_validators_1 = require("../validators/periodoMatricula.validators");
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const periodoController = new periodoMatricula_controller_1.PeriodoMatriculaController();
const matriculaArchivoController = new matriculaArchivo_controller_1.MatriculaArchivoController();
router.use(auth_1.authenticate);
// =============================================================================
// PERIODOS DE MATRÍCULA
// =============================================================================
// Consultas — cualquier rol autenticado puede ver el estado del período
router.get("/getAll", (0, acl_1.checkPermission)(types_1.Recurso.MATRICULAS, types_1.Accion.READ), periodoController.getAll);
// Endpoint principal que el frontend consulta para saber si el proceso está abierto
router.get("/activo", (0, acl_1.checkPermission)(types_1.Recurso.MATRICULAS, types_1.Accion.READ), periodoController.getActivo);
// Verifica si el período activo sigue dentro de sus fechas
// y lo desactiva automáticamente si venció
router.get("/vigencia", (0, acl_1.checkPermission)(types_1.Recurso.MATRICULAS, types_1.Accion.READ), periodoController.verificarVigencia);
router.get("/getById/:id", periodoMatricula_validators_1.periodoMatriculaIdValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.MATRICULAS, types_1.Accion.READ), periodoController.getById);
// Mutaciones — solo admin puede gestionar períodos
router.post("/create", acl_1.isAdmin, periodoMatricula_validators_1.createPeriodoMatriculaHttpValidator, validate_1.validate, periodoController.create);
router.put("/update/:id", acl_1.isAdmin, periodoMatricula_validators_1.periodoMatriculaIdValidator, periodoMatricula_validators_1.updatePeriodoMatriculaHttpValidator, validate_1.validate, periodoController.update);
// Activar/desactivar son acciones explícitas separadas del update
// para que quede claro en los logs y en el código qué pasó
router.patch("/activar/:id", acl_1.isAdmin, periodoMatricula_validators_1.periodoMatriculaIdValidator, validate_1.validate, periodoController.activar);
router.patch("/desactivar/:id", acl_1.isAdmin, periodoMatricula_validators_1.periodoMatriculaIdValidator, validate_1.validate, periodoController.desactivar);
router.delete("/delete/:id", acl_1.isAdmin, periodoMatricula_validators_1.periodoMatriculaIdValidator, validate_1.validate, periodoController.delete);
// =============================================================================
// ARCHIVOS DE MATRÍCULA
// Rutas anidadas bajo /periodos-matricula/matricula/:matriculaId/archivos
// para dejar claro el contexto en la URL
// =============================================================================
router.get("/matricula/:matriculaId/archivos", periodoMatricula_validators_1.matriculaIdParamValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.MATRICULAS, types_1.Accion.READ), matriculaArchivoController.getByMatricula);
// Checklist de documentos requeridos — muy usado en el formulario de matrícula
router.get("/matricula/:matriculaId/archivos/requeridos", periodoMatricula_validators_1.matriculaIdParamValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.MATRICULAS, types_1.Accion.READ), matriculaArchivoController.getArchivosRequeridos);
router.post("/matricula/:matriculaId/archivos/asociar", periodoMatricula_validators_1.asociarArchivoHttpValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.MATRICULAS, types_1.Accion.UPDATE), matriculaArchivoController.asociar);
router.post("/matricula/:matriculaId/archivos/asociarBulk", periodoMatricula_validators_1.asociarArchivosBulkHttpValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.MATRICULAS, types_1.Accion.UPDATE), matriculaArchivoController.asociarBulk);
router.delete("/matricula/:matriculaId/archivos/:archivoId", periodoMatricula_validators_1.desasociarArchivoHttpValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.MATRICULAS, types_1.Accion.UPDATE), matriculaArchivoController.desasociar);
exports.default = router;
//# sourceMappingURL=periodoMatricula.routes.js.map