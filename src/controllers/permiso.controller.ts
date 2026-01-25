import type { Request, Response, NextFunction } from "express"
import { PermisoRepository } from "../models/Repository/PermisoRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"

export class PermisoController {
  
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      const permisos = await PermisoRepository.findAll(pLimit, offset)

      res.status(200).json({
        success: true,
        data: permisos,
      })
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const permiso = await PermisoRepository.findById(id)

      if (!permiso) {
        throw new AppError("Permiso no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: permiso,
      })
    } catch (error) {
      next(error)
    }
  }

  async getByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = Number(req.params.roleId)
      const permisos = await PermisoRepository.findByRole(roleId)

      res.status(200).json({
        success: true,
        data: permisos,
      })
    } catch (error) {
      next(error)
    }
  }



  async assignToRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role_id, permiso_id } = req.body
      const result = await PermisoRepository.assignToRole(role_id, permiso_id)

      res.status(200).json({
        success: true,
        message: "Permiso asignado al rol exitosamente",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async removeFromRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId, permisoId } = req.params
      const result = await PermisoRepository.removeFromRole(Number(roleId), Number(permisoId))

      if (!result) {
        throw new AppError("Permiso no encontrado en este rol", 404)
      }

      res.status(200).json({
        success: true,
        message: "Permiso removido del rol exitosamente",
      })
    } catch (error) {
      next(error)
    }
  }

  async checkPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params
      const { recurso, accion } = req.query

      if (!recurso || !accion) {
        throw new AppError("Recurso y acción son requeridos", 400)
      }

      const tienePermiso = await PermisoRepository.checkPermission(
        Number(roleId),
        recurso as string,
        accion as string,
      )

      res.status(200).json({
        success: true,
        data: { tienePermiso },
      })
    } catch (error) {
      next(error)
    }
  }
}
