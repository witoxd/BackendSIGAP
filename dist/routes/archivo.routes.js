"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const acl_1 = require("../middleware/acl");
const archivo_controller_1 = require("../controllers/archivo.controller");
const archivo_validators_1 = require("../validators/archivo.validators");
const domain_1 = require("../validators/domain");
const validate_1 = require("../middleware/validate");
const express_validator_1 = require("express-validator");
const types_1 = require("../types");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
const archivoController = new archivo_controller_1.ArchivoController();
router.use(auth_1.authenticate);
// Obtener todos los archivos
router.get("/getAll", (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), archivoController.getAll.bind(archivoController));
// Obtener archivo por ID
router.get("/getById/:id", (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), archivoController.getById.bind(archivoController));
// Obtener archivos por persona
router.get("/getByPersonaId/:personaId", (0, express_validator_1.param)("personaId").isInt({ min: 1 }).withMessage("ID Invalido"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), archivoController.getByPersonaId.bind(archivoController));
// Obtener archivos por tipo
router.get("/getByTipo", (0, express_validator_1.query)("tipo_archivo").notEmpty().withMessage("Tipo de archivo requerido"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), archivoController.getByTipo.bind(archivoController));
// Descargar archivo
router.get("/download/:id", (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), archivoController.download.bind(archivoController));
// Ver archivo en navegador (para PDFs e imagenes)
router.get("/view/:id", (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), archivoController.view.bind(archivoController));
router.get("/viewPhoto/:personaId", (0, express_validator_1.param)("personaId").isInt({ min: 1 }).withMessage("ID de persona invalido"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), archivoController.getPhotoByPersonaId.bind(archivoController));
// Crear archivo con subida de archivo
// El campo del archivo debe llamarse "archivo" en el form-data
router.post("/create", (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.CREATE), multer_1.upload.single("archivo"), // Middleware de multer para uno o varios archivos
multer_1.handleMulterError, // Manejo de errores de multer
archivo_validators_1.createArchivoHttpValidator, validate_1.validate, domain_1.validateCreateArchivoDomain, archivoController.create.bind(archivoController));
router.post("/bulkCreate", (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.CREATE), multer_1.upload.array("archivos"), // Middleware de multer para uno o varios archivos
multer_1.handleMulterError, // Manejo de errores de multer
archivo_validators_1.bulkCreateArchivoHttpValidator, validate_1.validate, domain_1.validateCreateArchivoDomain, archivoController.bulkCreate.bind(archivoController));
// Actualizar archivo (opcionalmente con nuevo archivo)
router.put("/update/:id", (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido"), (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.UPDATE), multer_1.upload.single("archivo"), // Middleware de multer (opcional)
multer_1.handleMulterError, archivo_validators_1.updateArchivoHttpValidator, validate_1.validate, domain_1.validateUpdateArchivoDomain, archivoController.update.bind(archivoController));
// Eliminar archivo
router.delete("/delete/:id", (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID invalido"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.DELETE), archivoController.delete.bind(archivoController));
exports.default = router;
//# sourceMappingURL=archivo.routes.js.map