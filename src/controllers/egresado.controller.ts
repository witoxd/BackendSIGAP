import type { Request, Response, NextFunction } from "express"
import { EgresadoRepository } from "../models/Repository/EgresadoRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"
import { CreateEgresadoDTO, UpdateEgresadoDTO } from "../types"
import { EstudianteRepository } from "../models/Repository/EstudianteRepository"


type CreateEgresadoStaticRequest = Request<never, unknown, CreateEgresadoDTO>

type UpdateEgresadosStaticRequest = Request<{id: string}, unknown, UpdateEgresadoDTO>

export class EgresadoController {

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      const egresados = await EgresadoRepository.findAll(pLimit, offset)
      const total = await EgresadoRepository.count()

      res.status(200).json({
        success: true,
        data: egresados,
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
      const egresado = await EgresadoRepository.findById(id)

      if (!egresado) {
        throw new AppError("Egresado no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: egresado,
      })
    } catch (error) {
      next(error)
    }
  }

  async getByEstudianteId(req: Request, res: Response, next: NextFunction) {
    try {
      const estudianteId = Number(req.params.estudianteId)
      const egresado = await EgresadoRepository.findByEstudianteId(estudianteId)

      if (!egresado) {
        throw new AppError("Egresado no encontrado para este estudiante", 404)
      }

      res.status(200).json({
        success: true,
        data: egresado,
      })
    } catch (error) {
      next(error)
    }
  }

  async getByYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = Number(req.params.year)
      const egresados = await EgresadoRepository.findByYear(year)

      res.status(200).json({
        success: true,
        data: egresados,
      })
    } catch (error) {
      next(error)
    }
  }

  async create(req: CreateEgresadoStaticRequest, res: Response, next: NextFunction) {

    const { egresado: EgresadoData } = req.body

    const existingEstudiante = await EstudianteRepository.findById(EgresadoData.estudiante_id)

    if (!existingEstudiante) {
      throw new AppError("Error al intentar egresar al estudiante", 404)
    }

    try {

      const existingEgresado = await EgresadoRepository.findByEstudianteId(EgresadoData.estudiante_id)

      if(existingEgresado){
        throw new AppError("Ya el estudiante se graduo", 409)
      }
      const egresado = await EgresadoRepository.create(EgresadoData)

      res.status(201).json({
        success: true,
        message: "Egresado creado exitosamente",
        data: egresado,
      })
    } catch (error) {
      next(error)
    }
  }

  async update(req: UpdateEgresadosStaticRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)

      const {egresado: EgresadoData} = req.body

      const egresado = await EgresadoRepository.update(id, EgresadoData)

      if (!egresado) {
        throw new AppError("Egresado no encontrado o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Egresado actualizado exitosamente",
        data: egresado,
      })
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const egresado = await EgresadoRepository.delete(id)

      if (!egresado) {
        throw new AppError("Egresado no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        message: "Egresado eliminado exitosamente",
      })
    } catch (error) {
      next(error)
    }
  }
}
