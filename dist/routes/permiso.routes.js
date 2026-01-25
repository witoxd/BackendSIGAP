"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const acl_1 = require("../middleware/acl");
const permiso_controller_1 = require("../controllers/permiso.controller");
const validate_1 = require("../middleware/validate");
const express_validator_1 = require("express-validator");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const permisoController = new permiso_controller_1.PermisoController();
router.use(auth_1.authenticate);
router.get("/", (0, acl_1.checkPermission)(types_1.Recurso.PERMISOS, types_1.Accion.READ), permisoController.getAll.bind(permisoController));
router.get("/:id", (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID inválido"), validate_1.validate, acl_1.isAdmin, (0, acl_1.checkPermission)(types_1.Recurso.PERMISOS, types_1.Accion.READ), permisoController.getById.bind(permisoController));
// router.post(
//   "/",
//   createPermisoValidator,
//   validate,
//   checkPermission(Recurso.PERMISOS, Accion.CREATE),
//   permisoController.create.bind(permisoController),
// )
// router.put(
//   "/:id",
//   param("id").isInt({ min: 1 }).withMessage("ID inválido"),
//   validate,
//   checkPermission(Recurso.PERMISOS, Accion.UPDATE),
//   permisoController.create.bind(permisoController),
// )
exports.default = router;
//# sourceMappingURL=permiso.routes.js.map