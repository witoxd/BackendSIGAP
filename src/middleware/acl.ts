import type { Request, Response, NextFunction } from "express"
import { ForbiddenError, UnauthorizedError } from "../utils/AppError"
import { PermisoRepository } from "../models/Repository/PermisoRepository"
import type { Accion, Recurso } from "../types"

// ── checkPermission ───────────────────────────────────────────────────────────
// Verifica que el usuario tenga permiso para (accion) sobre (recurso).
// Admin siempre pasa — bypass directo sin tocar la BD.
// Para el resto: una sola query que une roles → permisos por nombre de rol,

export const checkPermission = (recurso: Recurso, accion: Accion) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError("Usuario no autenticado"))
      }

      // Admin bypasea todo — sin consulta a BD
      if (req.user.roles.includes("admin")) {
        return next()
      }

      // El JWT garantiza que roles es string[] — no hay formato {admin,docente}
      const tienePermiso = await PermisoRepository.checkPermissionByRoles(
        req.user.roles,
        recurso,
        accion,
      )

      if (!tienePermiso) {
        return next(new ForbiddenError(`No tienes permiso para ${accion} en ${recurso}`))
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// ── isAdmin ───────────────────────────────────────────────────────────────────
export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError("Usuario no autenticado"))
  }
  if (!req.user.roles.includes("admin")) {
    return next(new ForbiddenError("Solo administradores pueden realizar esta acción"))
  }
  next()
}

// ── canCreateUser ─────────────────────────────────────────────────────────────
export const canCreateUser = isAdmin
