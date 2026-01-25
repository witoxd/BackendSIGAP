"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = exports.idValidator = exports.searchValidator = exports.changePasswordValidator = exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
// Validadores de autenticación
exports.registerValidator = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email inválido").normalizeEmail(),
    (0, express_validator_1.body)("username")
        .isLength({ min: 3, max: 50 })
        .withMessage("Username debe tener entre 3 y 50 caracteres")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username solo puede contener letras, números y guiones bajos"),
    (0, express_validator_1.body)("contraseña")
        .isLength({ min: 8 })
        .withMessage("La contraseña debe tener al menos 8 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
        .withMessage("La contraseña debe contener al menos una mayúscula y una minúscula"),
    (0, express_validator_1.body)("nombres")
        .notEmpty()
        .withMessage("Los nombres son requeridos")
        .isLength({ max: 100 })
        .withMessage("Nombres demasiado largos"),
    (0, express_validator_1.body)("apellido_paterno").optional().isLength({ max: 100 }).withMessage("Apellido paterno demasiado largo"),
    (0, express_validator_1.body)("apellido_materno").optional().isLength({ max: 100 }).withMessage("Apellido materno demasiado largo"),
    (0, express_validator_1.body)("numero_documento").optional().isLength({ max: 20 }).withMessage("Número de documento inválido"),
    (0, express_validator_1.body)("fecha_nacimiento").isISO8601().withMessage("Fecha de nacimiento inválida"),
    (0, express_validator_1.body)("genero").optional().isIn(["Masculino", "Femenino", "Otro"]).withMessage("Género inválido"),
    (0, express_validator_1.body)("role")
        .notEmpty()
        .withMessage("El rol es requerido")
        .isIn(["estudiante", "profesor", "administrativo", "administrador"])
        .withMessage("Rol inválido"),
];
exports.loginValidator = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email inválido").normalizeEmail(),
    (0, express_validator_1.body)("contraseña").notEmpty().withMessage("La contraseña es requerida"),
];
exports.changePasswordValidator = [
    (0, express_validator_1.body)("currentPassword").notEmpty().withMessage("La contraseña actual es requerida"),
    (0, express_validator_1.body)("newPassword")
        .isLength({ min: 8 })
        .withMessage("La nueva contraseña debe tener al menos 8 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
        .withMessage("La contraseña debe contener al menos una mayúscula y una minúscula"),
];
// Validadores de búsqueda
exports.searchValidator = [
    (0, express_validator_1.query)("query").optional().isLength({ min: 1, max: 100 }).withMessage("Búsqueda inválida"),
    (0, express_validator_1.query)("nombres").optional().isLength({ min: 1, max: 100 }).withMessage("Nombres inválidos"),
    (0, express_validator_1.query)("numero_documento").optional().isLength({ min: 1, max: 20 }).withMessage("Número de documento inválido"),
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }).withMessage("Página debe ser un número positivo"),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Límite debe estar entre 1 y 100"),
];
// Validador de ID
exports.idValidator = [(0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("ID inválido")];
// Función para obtener paginación
const getPagination = (page, limit) => {
    const pageNum = page ? Math.max(1, Number.parseInt(page)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, Number.parseInt(limit))) : 50;
    const offset = (pageNum - 1) * limitNum;
    return { limit: limitNum, offset, page: pageNum };
};
exports.getPagination = getPagination;
//# sourceMappingURL=validators.js.map