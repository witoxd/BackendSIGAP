import type { Request, Response, NextFunction } from "express"
import { SedeRepository } from "../models/Repository/SedeRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"
import { CreateSedeDTO, UpdateSedeDTO  } from "../types"

type CreateSedeStaticDTO = Request<never, unknown, CreateSedeDTO>


export class SedeController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      const sedes = await SedeRepository.findAll(pLimit, offset)
      const total = await SedeRepository.count()

      res.status(200).json({
        success: true,
        data: sedes,
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
      const id = Number.parseInt(req.params.id)
      const sede = await SedeRepository.findById(id)

      if (!sede) {
        throw new AppError("Sede no encontrada", 404)
      }

      res.status(200).json({
        success: true,
        data: sede,
      })
    } catch (error) {
      next(error)
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { nombre, page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      const sedes = nombre ? await SedeRepository.findByNombre(nombre as string) : await SedeRepository.findAll(pLimit, offset)

      res.status(200).json({
        success: true,
        data: sedes,
      })
    } catch (error) {
      next(error)
    }
  }

  async create(req: CreateSedeStaticDTO, res: Response, next: NextFunction) {

    const {sede: SedeData} = req.body
    try {
      const sede = await SedeRepository.create(SedeData)

      if(!sede){
        throw new AppError("Error al crear sede", 403)
      }

      res.status(201).json({
        success: true,
        message: "Sede creada exitosamente",
        data: sede,
      })
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request<{id: string}, unknown, UpdateSedeDTO>, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const {sede: SedeData} = req.body
      const sede = await SedeRepository.update(id, SedeData)

      if (!sede) {
        throw new AppError("Sede no encontrada o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Sede actualizada exitosamente",
        data: sede,
      })
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const sede = await SedeRepository.delete(id)

      if (!sede) {
        throw new AppError("Sede no encontrada", 404)
      }

      res.status(200).json({
        success: true,
        message: "Sede eliminada exitosamente",
      })
    } catch (error) {
      next(error)
    }
  }
}
