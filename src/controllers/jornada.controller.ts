import type { Request, Response, NextFunction } from "express"
import { JornadaRepository } from "../models/Repository/JornadaRepository"
import { AppError } from "../utils/AppError"
import { CreateJornadaDTO, UpdateJornadDTO } from "../types"


type CreateJornadaStaticRequest = Request<never, unknown, CreateJornadaDTO>

export class JornadaController {

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const jornadas = await JornadaRepository.findAll()

      res.status(200).json({
        success: true,
        data: jornadas,
      })
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const jornada = await JornadaRepository.findById(id)

      if (!jornada) {
        throw new AppError("Jornada no encontrada", 404)
      }

      res.status(200).json({
        success: true,
        data: jornada,
      })
    } catch (error) {
      next(error)
    }
  }

  async create(req: CreateJornadaStaticRequest, res: Response, next: NextFunction) {

    const {jornada: Jornada} = req.body
    try {
      const jornada = await JornadaRepository.create(Jornada)

      res.status(201).json({
        success: true,
        message: "Jornada creada exitosamente",
        data: jornada,
      })
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request<{id: string}, unknown, UpdateJornadDTO>, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)

      const {jornada: updateJornada} = req.body
      
      const jornada = await JornadaRepository.update(id, updateJornada)

      if (!jornada) {
        throw new AppError("Jornada no encontrada o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Jornada actualizada exitosamente",
        data: jornada,
      })
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const jornada = await JornadaRepository.delete(id)

      if (!jornada) {
        throw new AppError("Jornada no encontrada", 404)
      }

      res.status(200).json({
        success: true,
        message: "Jornada eliminada exitosamente",
      })
    } catch (error) {
      next(error)
    }
  }
}
