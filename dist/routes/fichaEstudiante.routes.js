"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const acl_1 = require("../middleware/acl");
const fichaEstudiante_controller_1 = require("../controllers/fichaEstudiante.controller");
const fichaEstudiante_validators_1 = require("../validators/fichaEstudiante.validators");
const fichaEstudiante_domain_1 = require("../validators/domain/fichaEstudiante.domain");
const validate_1 = require("../middleware/validate");
const express_validator_1 = require("express-validator");
const types_1 = require("../types");
// ─────────────────────────────────────────────────────────────────────────────
// Validator de param reutilizado por todas las rutas de este módulo
// ─────────────────────────────────────────────────────────────────────────────
const estudianteIdParam = (0, express_validator_1.param)("estudianteId")
    .isInt({ min: 1 })
    .withMessage("estudianteId debe ser un número entero positivo");
const colegioIdParam = (0, express_validator_1.param)("colegioId")
    .isInt({ min: 1 })
    .withMessage("colegioId debe ser un número entero positivo");
// ─────────────────────────────────────────────────────────────────────────────
// Instancias de controladores
// ─────────────────────────────────────────────────────────────────────────────
const fichaController = new fichaEstudiante_controller_1.FichaEstudianteController();
const colegioController = new fichaEstudiante_controller_1.ColegioAnteriorController();
const viviendaController = new fichaEstudiante_controller_1.ViviendaEstudianteController();
const expedienteController = new fichaEstudiante_controller_1.ExpedienteController();
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// =============================================================================
// FICHA ESTUDIANTE
// =============================================================================
router.get("/fichaEstudiante/:estudianteId", estudianteIdParam, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.READ), fichaController.getByEstudiante.bind(fichaController));
router.put("/fichaEstudiante/:estudianteId", estudianteIdParam, fichaEstudiante_validators_1.upsertFichaHttpValidator, validate_1.validate, fichaEstudiante_domain_1.validateUpsertFichaDomain, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.UPDATE), fichaController.upsert.bind(fichaController));
router.delete("/fichaEstudiante/:estudianteId", estudianteIdParam, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.DELETE), fichaController.delete.bind(fichaController));
// =============================================================================
// COLEGIOS ANTERIORES
// =============================================================================
router.get("/colegiosAnteriores/:estudianteId", estudianteIdParam, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.READ), colegioController.getByEstudiante.bind(colegioController));
// Agrega un colegio individual
router.post("/colegiosAnteriores/:estudianteId", estudianteIdParam, fichaEstudiante_validators_1.createColegioHttpValidator, validate_1.validate, fichaEstudiante_domain_1.validateCreateColegioDomain, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.CREATE), colegioController.create.bind(colegioController));
// Reemplaza toda la lista de colegios
router.put("/colegiosAnteriores/:estudianteId/replaceAll", estudianteIdParam, fichaEstudiante_validators_1.replaceColegiosHttpValidator, validate_1.validate, fichaEstudiante_domain_1.validateReplaceColegiosDomain, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.UPDATE), colegioController.replaceAll.bind(colegioController));
// Actualiza un colegio individual
router.patch("/colegiosAnteriores/:estudianteId/:colegioId", estudianteIdParam, fichaEstudiante_validators_1.updateColegioHttpValidator, validate_1.validate, fichaEstudiante_domain_1.validateUpdateColegioDomain, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.UPDATE), colegioController.update.bind(colegioController));
router.delete("/colegiosAnteriores/:estudianteId/:colegioId", estudianteIdParam, colegioIdParam, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.DELETE), colegioController.delete.bind(colegioController));
// =============================================================================
// VIVIENDA ESTUDIANTE
// =============================================================================
router.get("/viviendaEstudiante/:estudianteId", estudianteIdParam, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.READ), viviendaController.getByEstudiante.bind(viviendaController));
router.put("/viviendaEstudiante/:estudianteId", estudianteIdParam, fichaEstudiante_validators_1.upsertViviendaHttpValidator, validate_1.validate, fichaEstudiante_domain_1.validateUpsertViviendaDomain, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.UPDATE), viviendaController.upsert.bind(viviendaController));
router.delete("/viviendaEstudiante/:estudianteId", estudianteIdParam, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.DELETE), viviendaController.delete.bind(viviendaController));
// =============================================================================
// EXPEDIENTE COMPLETO
// Agrupa las 3 secciones en un solo endpoint — útil para el formulario
// de caracterización completo que se llena en un solo flujo
// =============================================================================
router.get("/expediente/:estudianteId", estudianteIdParam, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.READ), expedienteController.getExpediente.bind(expedienteController));
router.put("/expediente/:estudianteId", estudianteIdParam, fichaEstudiante_validators_1.upsertExpedienteHttpValidator, validate_1.validate, fichaEstudiante_domain_1.validateUpsertExpedienteDomain, (0, acl_1.checkPermission)(types_1.Recurso.EXPEDIENTE, types_1.Accion.UPDATE), expedienteController.upsertExpediente.bind(expedienteController));
exports.default = router;
//# sourceMappingURL=fichaEstudiante.routes.js.map