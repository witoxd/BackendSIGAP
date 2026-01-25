"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const acl_1 = require("../middleware/acl");
const auditoria_controller_1 = require("../controllers/auditoria.controller");
const validate_1 = require("../middleware/validate");
const express_validator_1 = require("express-validator");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const auditoriaController = new auditoria_controller_1.AuditoriaController();
router.use(auth_1.authenticate);
router.get("/", (0, acl_1.checkPermission)(types_1.Recurso.PERMISOS, types_1.Accion.READ), auditoriaController.getAll.bind(auditoriaController));
router.get("/:id", (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID inválido"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.PERMISOS, types_1.Accion.READ), auditoriaController.getById.bind(auditoriaController));
router.get("/usuario/:usuarioId", (0, express_validator_1.param)("usuarioId").isInt({ min: 1 }).withMessage("ID de usuario inválido"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.PERMISOS, types_1.Accion.READ), auditoriaController.getByUsuarioId.bind(auditoriaController));
router.get("/accion/:accion", (0, express_validator_1.param)("accion").notEmpty().withMessage("Acción requerida"), validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.PERMISOS, types_1.Accion.READ), auditoriaController.getByAccion.bind(auditoriaController));
exports.default = router;
//# sourceMappingURL=auditoria.routes.js.map