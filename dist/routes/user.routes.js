"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const validators_1 = require("../utils/validators");
const validate_1 = require("../middleware/validate");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Buscar usuarios (cualquier usuario autenticado)
router.get("/search", validators_1.searchValidator, validate_1.validate, userController.searchUsers.bind(userController));
// Obtener usuario por ID (solo admin o el mismo usuario)
router.get("/getById/:id", validators_1.idValidator, validate_1.validate, auth_1.isSelfOrAdmin, userController.getUser.bind(userController));
// Asignar rol de administrador (solo admin)
router.post("/:id/assign-admin", auth_1.isAdmin, validators_1.idValidator, validate_1.validate, userController.assignAdmin.bind(userController));
// Transferir rol de administrador (solo admin)
router.post("/transfer-admin", auth_1.isAdmin, (0, express_validator_1.body)("toUserId").isInt({ min: 1 }).withMessage("ID de usuario destino inválido"), validate_1.validate, userController.transferAdmin.bind(userController));
// Activar/desactivar usuario (solo admin)
router.patch("/:id/status", auth_1.isAdmin, validators_1.idValidator, (0, express_validator_1.body)("activo").isBoolean().withMessage("Estado debe ser booleano"), validate_1.validate, userController.toggleStatus.bind(userController));
exports.default = router;
//# sourceMappingURL=user.routes.js.map