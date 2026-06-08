import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import type { JwtPayload } from "../types"
import { UnauthorizedError, ForbiddenError } from "../utils/AppError"

// ── Validación de JWT_SECRET al cargar el módulo ──────────────────────────────
// Si la JWT_SECRET no está configurado en el archivo .env, el servidor no iniciara.
// Falla rápido en startup en lugar de lanzar un error 500 en cada request.
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está configurado. El servidor no puede iniciar sin él.")
}

// ── Extensión del tipo Request de Express ─────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// ── authenticate ──────────────────────────────────────────────────────────────
// Lee el token desde la cookie httpOnly (ruta normal) o desde el header
// Authorization (para Swagger y herramientas de desarrollo).
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token: string | undefined =
      req.cookies?.sigap_access ??
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : undefined)

    if (!token) {
      return next(new UnauthorizedError("Token no proporcionado"))
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = decoded
    next()
  } catch (error: any) {
    switch (error.name) {
      case "TokenExpiredError":
        return next(new UnauthorizedError("La sesión ha expirado. Por favor, inicia sesión nuevamente."))
      case "JsonWebTokenError":
        return next(new UnauthorizedError("Token inválido"))
      case "NotBeforeError":
        // Token con nbf en el futuro — reloj del servidor desincronizado o token manipulado
        return next(new UnauthorizedError("Token aún no válido"))
      default:
        return next(error)
    }
  }
}

// ── authorize ─────────────────────────────────────────────────────────────────
// Verifica que el usuario autenticado tenga al menos uno de los roles indicados.
export const authorize = (roles: string | string[]) => {
  const allowed = Array.isArray(roles) ? roles : [roles]

  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Usuario no autenticado"))
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles]
    if (!userRoles.some((r) => allowed.includes(r))) {
      return next(new ForbiddenError("No tienes permisos para realizar esta acción"))
    }

    next()
  }
}

// ── isAdmin ───────────────────────────────────────────────────────────────────
export const isAdmin = authorize("admin")

// ── isSelfOrAdmin ─────────────────────────────────────────────────────────────
// Permite que el usuario acceda a sus propios datos (req.params.id) o que un
// administrador acceda a cualquier recurso.
export const isSelfOrAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError("Usuario no autenticado"))
  }

  const requestedId = Number(req.params.id)
  const isSelf      = req.user.userId === requestedId
  const isAdminUser = req.user.roles.includes("admin")

  if (!isSelf && !isAdminUser) {
    return next(new ForbiddenError("No tienes permisos para acceder a este recurso"))
  }

  next()
}
