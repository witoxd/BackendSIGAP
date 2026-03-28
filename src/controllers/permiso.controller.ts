import type { Request, Response, NextFunction } from "express"
import { PermisoRepository } from "../models/Repository/PermisoRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"
import { asyncHandler } from "../utils/asyncHandler"

export class PermisoController {
  
   getAll = asyncHandler( async (req: Request, res: Response, next: NextFunction)  => {
      const { page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      const permisos = await PermisoRepository.findAll(pLimit, offset)

      res.status(200).json({
        success: true,
        data: permisos,
      })
  })

   getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const id = Number(req.params.id)
      const permiso = await PermisoRepository.findById(id)

      if (!permiso) {
        throw new AppError("Permiso no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: permiso,
      })
  })

   getByRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

      const roleId = Number(req.params.roleId)
      const permisos = await PermisoRepository.findByRole(roleId)

      res.status(200).json({
        success: true,
        data: permisos,
      })
  })



   assignToRole =asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { role_id, permiso_id } = req.body
      const result = await PermisoRepository.assignToRole(role_id, permiso_id)

      res.status(200).json({
        success: true,
        message: "Permiso asignado al rol exitosamente",
        data: result,
      })
  })

 removeFromRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { roleId, permisoId } = req.params
      const result = await PermisoRepository.removeFromRole(Number(roleId), Number(permisoId))

      if (!result) {
        throw new AppError("Permiso no encontrado en este rol", 404)
      }

      res.status(200).json({
        success: true,
        message: "Permiso removido del rol exitosamente",
      })
  })

   checkPermission = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
  })
  
}
