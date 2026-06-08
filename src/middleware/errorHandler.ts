import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/AppError"

// ── Códigos de error de PostgreSQL ────────────────────────────────────────────
// pg expone err.code con los códigos ISO 9075 del motor. Usarlos es mucho más

const PG_UNIQUE_VIOLATION       = "23505"
const PG_FK_VIOLATION           = "23503"
const PG_NOT_NULL_VIOLATION     = "23502"
const PG_QUERY_CANCELED         = "57014"  // statement_timeout o cancel query
const PG_TOO_MANY_CONNECTIONS   = "53300"
const PG_CONNECTION_CLASS       = "08"     // 08xxx = connection_exception class

// ── Campos sensibles ──────────────────────────────────────────────────────────
// Se redactan en el body del request antes de logear.
const SENSITIVE_BODY_FIELDS = new Set([
  "contraseña", "password", "currentPassword", "newPassword",
  "token", "secret", "apiKey", "refreshToken",
])

// Se oculta el log del headers.
const SENSITIVE_HEADERS = new Set([
  "authorization", "cookie", "x-api-key", "x-auth-token",
])

// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== "object") return body
  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([k, v]) =>
      SENSITIVE_BODY_FIELDS.has(k) ? [k, "[REDACTED]"] : [k, v]
    )
  )
}

function sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) =>
      SENSITIVE_HEADERS.has(k.toLowerCase()) ? [k, "[REDACTED]"] : [k, v]
    )
  )
}

// Elimina query params de la URL antes de logear — pueden contener tokens o IDs
function sanitizePath(url: string): string {
  try {
    return new URL(url, "http://x").pathname
  } catch {
    return "/?"
  }
}

// Log estructurado en una sola línea JSON — parseable por herramientas de monitoreo
function logError(req: Request, err: Error, statusCode: number): void {
  const isDev = process.env.NODE_ENV === "development"

  const entry: Record<string, unknown> = {
    level:      "error",
    status:     statusCode,
    method:     req.method,
    path:       sanitizePath(req.originalUrl),
    ip:         req.ip,
    message:    err.message,
    code:       (err as any).code ?? undefined,
    timestamp:  new Date().toISOString(),
  }

  // Stack solo en development — en producción ocupa espacio sin aportar al monitoreo
  if (isDev) {
    entry.stack   = err.stack
    entry.body    = sanitizeBody(req.body)
    entry.headers = sanitizeHeaders(req.headers as Record<string, unknown>)
  }

  console.error(JSON.stringify(entry))
}

// ── Manejador de errores ──────────────────────────────────────────────────────

export const errorHandler = (
  err:  Error | AppError,
  req:  Request,
  res:  Response,
  _next: NextFunction,
): void => {
  const isDev = process.env.NODE_ENV === "development"

  // ── Errores operacionales (AppError) ─────────────────────────────────────
  // Son errores del dominio: validación, auth, not found, etc.
  // Se devuelven tal cual al cliente — el mensaje es seguro para mostrar.
  if (err instanceof AppError && err.isOperational) {
    logError(req, err, err.statusCode)
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors:  err.errors,
      ...(isDev && { stack: err.stack }),
    })
    return
  }

  // ── Errores de PostgreSQL por código ISO ──────────────────────────────────
  // pg adjunta el código del motor en err.code. más fiable que comparar

  const pgCode: string | undefined = (err as any).code

  if (pgCode) {
    if (pgCode === PG_UNIQUE_VIOLATION) {
      logError(req, err, 409)
      res.status(409).json({
        success: false,
        message: "Ya existe un registro con esos datos. Verifica e intenta nuevamente.",
        code:    "CONFLICT",
      })
      return
    }

    if (pgCode === PG_FK_VIOLATION) {
      logError(req, err, 409)
      res.status(409).json({
        success: false,
        message: "No se puede completar la operación porque el registro está referenciado por otros datos.",
        code:    "FOREIGN_KEY_CONFLICT",
      })
      return
    }

    if (pgCode === PG_NOT_NULL_VIOLATION) {
      logError(req, err, 400)
      res.status(400).json({
        success: false,
        message: "Faltan campos requeridos en la solicitud.",
        code:    "MISSING_REQUIRED_FIELD",
      })
      return
    }

    if (pgCode === PG_QUERY_CANCELED) {
      logError(req, err, 503)
      res.status(503).json({
        success: false,
        message: "La consulta tardó demasiado y fue cancelada. Intenta con filtros más específicos.",
        code:    "QUERY_TIMEOUT",
      })
      return
    }

    if (pgCode === PG_TOO_MANY_CONNECTIONS || pgCode.startsWith(PG_CONNECTION_CLASS)) {
      logError(req, err, 503)
      res.status(503).json({
        success: false,
        message: "El servicio está temporalmente no disponible. Por favor, intenta en unos segundos.",
        code:    "SERVICE_UNAVAILABLE",
      })
      return
    }
  }

  // ── Errores de conexión de Node (antes de llegar a pg) ───────────────────
  // ECONNREFUSED, ETIMEDOUT, etc. — la BD no está disponible en absoluto.
  const nodeCode: string | undefined = (err as NodeJS.ErrnoException).code
  if (nodeCode && ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"].includes(nodeCode)) {
    logError(req, err, 503)
    res.status(503).json({
      success: false,
      message: "No se pudo conectar al servidor de base de datos. Intenta más tarde.",
      code:    "DATABASE_UNAVAILABLE",
    })
    return
  }

  // ── Error de sintaxis JSON en el body del request ─────────────────────────
  // Express lanza un SyntaxError cuando el cleinte manda un JSON mal formado. No es un AppError, pero es un error común que merece un mensaje claro al cliente y muy util para la depuracion de errores.
  if (err instanceof SyntaxError && "body" in err) {
    logError(req, err, 400)
    res.status(400).json({
      success: false,
      message: "El cuerpo de la solicitud contiene JSON inválido.",
      code:    "INVALID_JSON",
    })
    return
  }

  // ──  Error no manejado (500) ───────────────────────────────────────────────
  // Algo inesperado — nunca exponer detalles internos en producción.
  logError(req, err, 500)
  res.status(500).json({
    success: false,
    message: "Ha ocurrido un error interno. Por favor, intenta nuevamente o contacta al administrador.",
    code:    "INTERNAL_SERVER_ERROR",
    ...(isDev && { error: err.message, stack: err.stack }),
  })
}
