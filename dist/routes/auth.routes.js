"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validators_1 = require("../utils/validators");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const acl_1 = require("../middleware/acl");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Rutas públicas (con rate limiting estricto)
router.post("/register", auth_1.authenticate, acl_1.canCreateUser, rateLimiter_1.authRateLimiter, validators_1.registerValidator, validate_1.validate, authController.register.bind(authController));
router.post("/login", rateLimiter_1.authRateLimiter, validators_1.loginValidator, validate_1.validate, authController.login.bind(authController));
// Rutas protegidas
router.get("/me", auth_1.authenticate, authController.me.bind(authController));
router.post("/change-password", auth_1.authenticate, validators_1.changePasswordValidator, validate_1.validate, authController.changePassword.bind(authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map