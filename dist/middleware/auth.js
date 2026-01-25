"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSelfOrAdmin = exports.isAdmin = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError_1.UnauthorizedError("Token no proporcionado");
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET no configurado");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new AppError_1.UnauthorizedError("Token expirado"));
        }
        if (error.name === "JsonWebTokenError") {
            return next(new AppError_1.UnauthorizedError("Token inválido"));
        }
        next(error);
    }
});
exports.authenticate = authenticate;
// export const authorize = (roles: string | string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return next(new UnauthorizedError("Usuario no autenticado"))
//     }
//     const rolesArray = Array.isArray(roles) ? roles : [roles]
//     const hasRole = req.user.roles.some((role) => rolesArray.includes(role))
//     if (!hasRole) {
//       return next(new ForbiddenError("No tiene permisos para realizar esta acción"))
//     }
//     next()
//   }
// }
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError_1.UnauthorizedError("Usuario no autenticado"));
        }
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        const userRoles = Array.isArray(req.user.roles)
            ? req.user.roles
            : [req.user.roles];
        console.log("Rol del usuario a peticion", userRoles);
        console.log("Array de roles", rolesArray);
        const normalizeRole = (role) => role.replace(/[{}"]/g, "").trim();
        const hasRole = userRoles.some(role => rolesArray.includes(normalizeRole(role)));
        if (!hasRole) {
            return next(new AppError_1.ForbiddenError("No tiene permisos para realizar esta acción"));
        }
        next();
    };
};
exports.authorize = authorize;
// Middleware para verificar que el usuario es admin
exports.isAdmin = (0, exports.authorize)("admin");
// Middleware para verificar que el usuario puede acceder a sus propios datos o es admin
const isSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new AppError_1.UnauthorizedError("Usuario no autenticado"));
    }
    const requestedUserId = Number.parseInt(req.params.id);
    const isOwnProfile = req.user.userId === requestedUserId;
    const isAdminUser = req.user.roles.includes("admin");
    if (!isOwnProfile && !isAdminUser) {
        return next(new AppError_1.ForbiddenError("No tiene permisos para acceder a este recurso"));
    }
    next();
};
exports.isSelfOrAdmin = isSelfOrAdmin;
//# sourceMappingURL=auth.js.map