import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import type { JwtPayload } from "../types"
import { UnauthorizedError, ForbiddenError } from "../utils/AppError"

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token no proporcionado")
    }

    const token = authHeader.substring(7)

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no configurado")
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
    req.user = decoded

    next()
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token expirado"))
    }
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Token inválido"))
    }
    next(error)
  }
}

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

export const authorize = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Usuario no autenticado"))
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles]
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles]

    const hasRole = userRoles.some((role) => rolesArray.includes(role))


    if (!hasRole) {
      return next(new ForbiddenError("No tiene permisos para realizar esta acción"))
    }

    next()
  }
}


// Middleware para verificar que el usuario es admin
export const isAdmin = authorize("admin")

// Middleware para verificar que el usuario puede acceder a sus propios datos o es admin
export const isSelfOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError("Usuario no autenticado"))
  }

  const requestedUserId = Number(req.params.id)
  const isOwnProfile = req.user.userId === requestedUserId
  const isAdminUser = req.user.roles.includes("admin")

  if (!isOwnProfile && !isAdminUser) {
    return next(new ForbiddenError("No tiene permisos para acceder a este recurso"))
  }

  next()
}
