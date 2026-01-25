import type { Request, Response, NextFunction } from "express"
import { AuditoriaRepository } from "../models/Repository/AuditoriaRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"

export class AuditoriaController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      const auditorias = await AuditoriaRepository.findAll(pLimit, offset)
      const total = await AuditoriaRepository.count()

      res.status(200).json({
        success: true,
        data: auditorias,
        pagination: {
          page: Math.floor(offset / pLimit) + 1,
          limit: pLimit,
          total,
          pages: Math.ceil(total / pLimit),
        },
      })
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const auditoria = await AuditoriaRepository.findById(id)

      if (!auditoria) {
        throw new AppError("Registro de auditoría no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: auditoria,
      })
    } catch (error) {
      next(error)
    }
  }

  async getByUsuarioId(req: Request, res: Response, next: NextFunction) {
    try {
      const { usuario_id, page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      if (!usuario_id) {
        throw new AppError("El usuario_id es requerido", 400)
      }

      const auditorias = await AuditoriaRepository.findByUsuarioId(Number.parseInt(usuario_id as string), pLimit, offset)

      res.status(200).json({
        success: true,
        data: auditorias,
      })
    } catch (error) {
      next(error)
    }
  }

  async getByAccion(req: Request, res: Response, next: NextFunction) {
    try {
      const { accion, page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      if (!accion) {
        throw new AppError("La acción es requerida", 400)
      }

      const auditorias = await AuditoriaRepository.findByAccion(accion as string, pLimit, offset)

      res.status(200).json({
        success: true,
        data: auditorias,
      })
    } catch (error) {
      next(error)
    }
  }

  async getByTabla(req: Request, res: Response, next: NextFunction) {
    try {
      const { tabla, page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      if (!tabla) {
        throw new AppError("La tabla es requerida", 400)
      }

      const auditorias = await AuditoriaRepository.findByTabla(tabla as string, pLimit, offset)

      res.status(200).json({
        success: true,
        data: auditorias,
      })
    } catch (error) {
      next(error)
    }
  }

  // async create(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const auditoria = await AuditoriaRepository.create(req.body)

  //     res.status(201).json({
  //       success: true,
  //       message: "Registro de auditoría creado exitosamente",
  //       data: auditoria,
  //     })
  //   } catch (error) {
  //     next(error)
  //   }
  // }
}
