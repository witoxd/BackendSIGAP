"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validators_1 = require("../utils/validators");
const auth_validators_1 = require("../validators/auth.validators");
const domain_1 = require("../validators/domain");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const acl_1 = require("../middleware/acl");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
const createUserMiddlewares = [
    auth_1.authenticate,
    auth_1.isAdmin,
    acl_1.canCreateUser,
    ...auth_validators_1.createUserHttpValidator,
    validate_1.validate,
    domain_1.validateCreateUserDomain,
];
const createUserWithPersonaMiddlewares = [
    auth_1.authenticate,
    auth_1.isAdmin,
    acl_1.canCreateUser,
    ...auth_validators_1.createUserWithPersonaHttpValidator,
    validate_1.validate,
    domain_1.validateCreateUserWithPersonaDomain,
];
const resetPasswordMiddlewares = [
    auth_1.authenticate,
    auth_1.isAdmin,
    (0, acl_1.checkPermission)(types_1.Recurso.USUARIOS, types_1.Accion.UPDATE),
    ...auth_validators_1.resetPasswordHttpValidator,
    validate_1.validate,
    domain_1.validateResetPasswordDomain,
];
// Rutas públicas (con rate limiting estricto)
router.post("/register", auth_1.authenticate, acl_1.canCreateUser, rateLimiter_1.authRateLimiter, validators_1.registerValidator, validate_1.validate, authController.register.bind(authController));
router.post("/login", rateLimiter_1.authRateLimiter, validators_1.loginValidator, validate_1.validate, authController.login.bind(authController));
// Rutas protegidas
router.get("/me", auth_1.authenticate, authController.me.bind(authController));
router.post("/change-password", auth_1.authenticate, validators_1.changePasswordValidator, validate_1.validate, authController.changePassword.bind(authController));
router.post("/users/with-persona", ...createUserWithPersonaMiddlewares, authController.createUserWithPersona.bind(authController));
router.post("/create-user/:personaId", ...createUserMiddlewares, authController.createUser.bind(authController));
router.post("/resetPassword/:id", ...resetPasswordMiddlewares, authController.resetPassword.bind(authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map