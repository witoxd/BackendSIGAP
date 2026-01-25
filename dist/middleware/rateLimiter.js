"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutos
    max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // 100 requests por ventana
    message: {
        success: false,
        message: "Demasiadas solicitudes desde esta IP. Por favor, intente nuevamente más tarde.",
        code: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // No aplicar rate limiting a health check
        return req.path === "/health";
    },
});
// Rate limiter más estricto para autenticación
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: {
        success: false,
        message: "Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 5 minutos.",
        code: "AUTH_RATE_LIMIT_EXCEEDED",
    },
    skipSuccessfulRequests: true,
});
//# sourceMappingURL=rateLimiter.js.map