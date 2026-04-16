import type { Request, Response, NextFunction } from "express"
import { ForbiddenError, UnauthorizedError } from "../utils/AppError"
import { RoleRepository } from "../models/Repository/RoleRepository"
import { PermisoRepository } from "../models/Repository/PermisoRepository"
import type { Accion, Recurso } from "../types"

// Middleware para verificar permisos ACL
export const checkPermission = (recurso: Recurso, accion: Accion) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Usuario no autenticado")
      }

      const roles = req.user.roles as string | string[]


      if (roles.includes("admin")) {
        return next()
      }

      let rolesArray: string[] = []

      if (typeof roles === "string") {
        rolesArray = roles
          .replace(/[{}]/g, "")
          .split(",")
          .map(r => r.trim())
      } else {
        rolesArray = roles
      }


      let tienePermiso = false

      for (const roleName of rolesArray) {
        const role = await RoleRepository.findByName(roleName)
        if (role) {
          const permiso = await PermisoRepository.checkPermission(
            role.role_id,
            recurso,
            accion
          )
          if (permiso) {
            tienePermiso = true
            break
          }
        }
      }


      if (!tienePermiso) {
        throw new ForbiddenError(`No tienes permiso para ${accion} en ${recurso}`)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// Middleware para verificar si es admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Usuario no autenticado")
    }

    if (!req.user.roles.includes("admin")) {
      throw new ForbiddenError("Solo administradores pueden realizar esta acción")
    }

    next()
  } catch (error) {
    next(error)
  }
}

// Middleware para verificar si puede crear usuarios (solo admin)
export const canCreateUser = isAdmin
