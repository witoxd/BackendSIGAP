import rateLimit from "express-rate-limit"

export const rateLimiter = rateLimit({
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
    return req.path === "/health"
  },
})

// Rate limiter más estricto para autenticación
export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    message: "Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 5 minutos.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  skipSuccessfulRequests: true,
})
