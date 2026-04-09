"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const acl_1 = require("../middleware/acl");
const tipoArchivo_controller_1 = require("../controllers/tipoArchivo.controller");
const tipoArchivo_validators_1 = require("../validators/tipoArchivo.validators");
const tipoArchivo_domain_1 = require("../validators/domain/tipoArchivo.domain");
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const tipoArchivoController = new tipoArchivo_controller_1.TipoArchivoController();
router.use(auth_1.authenticate);
// Obtener todos los tipos de archivo
router.get("/getAll", (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), tipoArchivoController.getAll.bind(tipoArchivoController));
// Obtener tipo de archivo por ID
router.get("/getById/:id", tipoArchivo_validators_1.tipoArchivoIdValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), tipoArchivoController.getById.bind(tipoArchivoController));
// Obtener tipo de archivo por rol de persona
router.get("/getByRol/:rol", tipoArchivo_validators_1.tipoArchivoRolValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), tipoArchivoController.getRolByTipoArchivo.bind(tipoArchivoController));
// Obtener tipo de archivo por nombre
router.get("/getByNombre/:nombre", tipoArchivo_validators_1.tipoArchivoNombreValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), tipoArchivoController.getByNombre.bind(tipoArchivoController));
// Verificar si una extensión es permitida
router.get("/checkExtension/:id", tipoArchivo_validators_1.checkExtensionValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.READ), tipoArchivoController.checkExtension.bind(tipoArchivoController));
// Crear tipo de archivo
router.post("/create", tipoArchivo_validators_1.createTipoArchivoHttpValidator, validate_1.validate, tipoArchivo_domain_1.validateCreateTipoArchivoDomain, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.CREATE), tipoArchivoController.create.bind(tipoArchivoController));
// Actualizar tipo de archivo
router.put("/update/:id", tipoArchivo_validators_1.tipoArchivoIdValidator, tipoArchivo_validators_1.updateTipoArchivoHttpValidator, validate_1.validate, tipoArchivo_domain_1.validateUpdateTipoArchivoDomain, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.UPDATE), tipoArchivoController.update.bind(tipoArchivoController));
// Eliminar tipo de archivo
router.delete("/delete/:id", tipoArchivo_validators_1.tipoArchivoIdValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.DOCUMENTOS, types_1.Accion.DELETE), tipoArchivoController.delete.bind(tipoArchivoController));
exports.default = router;
//# sourceMappingURL=tipoArchivo.routes.js.map