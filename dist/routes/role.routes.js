"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// TODO: Implementar controladores de roles y permisos
// GET /api/roles - Listar roles (solo admin)
// POST /api/roles - Crear rol (solo admin)
// GET /api/roles/:id/permisos - Listar permisos de un rol (solo admin)
// POST /api/roles/:id/permisos - Asignar permiso a rol (solo admin)
router.get("/", auth_1.isAdmin, (req, res) => {
    res.status(501).json({
        success: false,
        message: "Endpoint no implementado aún",
    });
});
exports.default = router;
//# sourceMappingURL=role.routes.js.map