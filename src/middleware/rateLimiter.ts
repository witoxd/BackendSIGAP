import rateLimit from "express-rate-limit"
import type { Request } from "express"

// ── Extracción de userId del JWT ──────────────────────────────────────────────
// Se decodificacion del payload SIN verificar la firma — solo para usar como clave
// del rate limiter. La verificación real sigue ocurriendo en el middleware
// authenticate. Si el token es inválido o no existe, se usa la IP como fallback.
// Por qué esto y no la IP: en una LAN escolar todos los usuarios comparten la
// misma IP pública. Limitar por IP bloquearía a usuarios legítimos entre sí.
function extractRateLimitKey(req: Request): string {
  try {
    const auth  = req.headers.authorization
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : (req.cookies?.accessToken as string | undefined)
    if (!token) return req.ip ?? "anonymous"

    const payloadB64 = token.split(".")[1]
    if (!payloadB64) return req.ip ?? "anonymous"

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"))
    if (payload?.userId) return `user:${payload.userId}`
  } catch {
    // Decodificación falló — puede ser un token malformado o un ataque
  }
  return req.ip ?? "anonymous"
}

// ── Limiter global por IP ──────────────────────────────────────────────────
// Muy generoso — solo frena ataques externos de volumetría (DDoS).
// No afecta usuarios internos porque los limiters de API son los que mandan.
export const globalIpLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,  // 15 minutos
  max:            50_000,           // 50k req por IP por ventana — solo frena DDoS reales
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => req.path === "/health",
  message: {
    success: false,
    message: "Demasiadas solicitudes desde esta dirección. Intente más tarde.",
    code:    "GLOBAL_RATE_LIMIT_EXCEEDED",
  },
})

// ── Limiter de API por usuario ─────────────────────────────────────────────
// Para rutas autenticadas /api/*. Clave: userId del JWT (o IP como fallback).
// 1,500 req / 15 min por usuario ≈ 100 req/min — suficiente para uso intenso.
export const apiUserLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             1_500,
  keyGenerator:    extractRateLimitKey,
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => req.path === "/health",
  message: {
    success: false,
    message: "Has excedido el límite de solicitudes. Espera un momento e intenta nuevamente.",
    code:    "API_RATE_LIMIT_EXCEEDED",
  },
})

// ── Limiter de autenticación ───────────────────────────────────────────────
// Estricto por IP — protege contra brute force en el endpoint de login.
// 15 intentos en 15 min es suficiente para olvidar una contraseña sin ser un bot.
// skipSuccessfulRequests: los logins exitosos no consumen cuota.
export const authLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    15,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.",
    code:    "AUTH_RATE_LIMIT_EXCEEDED",
  },
})

// ── Limiter de escrituras ──────────────────────────────────────────────────
// Para POST / PUT / PATCH / DELETE en rutas de datos.
// Las operaciones de escritura son más costosas y sensibles que las lecturas.
// 300 escrituras / 15 min por usuario ≈ 20/min — nadie necesita más en este sistema.
export const writeLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             300,
  keyGenerator:    extractRateLimitKey,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Has alcanzado el límite de operaciones de escritura. Espera un momento.",
    code:    "WRITE_RATE_LIMIT_EXCEEDED",
  },
})

// ── Aliases de compatibilidad ─────────────────────────────────────────────────
export const rateLimiter    = apiUserLimiter  
export const authRateLimiter = authLimiter    
