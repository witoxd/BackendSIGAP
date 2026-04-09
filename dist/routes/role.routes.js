"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
router.get("/", auth_1.isAdmin, (req, res) => {
    res.status(501).json({
        success: false,
        message: "Endpoint no implementado aún",
    });
});
exports.default = router;
//# sourceMappingURL=role.routes.js.map