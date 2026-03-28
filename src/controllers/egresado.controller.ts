import type { Request, Response, NextFunction } from "express"
import { EgresadoRepository } from "../models/Repository/EgresadoRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"
import { CreateEgresadoDTO, UpdateEgresadoDTO } from "../types"
import { EstudianteRepository } from "../models/Repository/EstudianteRepository"
import { asyncHandler } from "../utils/asyncHandler"


type CreateEgresadoStaticRequest = Request<never, unknown, CreateEgresadoDTO>

type UpdateEgresadosStaticRequest = Request<{id: string}, unknown, UpdateEgresadoDTO>

export class EgresadoController {

   getAll = asyncHandler (async (req: Request, res: Response, next: NextFunction) => {
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
  })

   getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

      const id = Number(req.params.id)
      const egresado = await EgresadoRepository.findById(id)

      if (!egresado) {
        throw new AppError("Egresado no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: egresado,
      })
  })

   getByEstudianteId = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
      const estudianteId = Number(req.params.estudianteId)
      const egresado = await EgresadoRepository.findByEstudianteId(estudianteId)

      if (!egresado) {
        throw new AppError("Egresado no encontrado para este estudiante", 404)
      }

      res.status(200).json({
        success: true,
        data: egresado,
      })
  })

   getByYear = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const year = Number(req.params.year)
      const egresados = await EgresadoRepository.findByYear(year)

      res.status(200).json({
        success: true,
        data: egresados,
      })
  })

   create = asyncHandler(async (req: Request, res: Response, next: NextFunction) =>{

    const { egresado: EgresadoData } = req.body as CreateEgresadoDTO

    const existingEstudiante = await EstudianteRepository.findById(EgresadoData.estudiante_id)

    if (!existingEstudiante) {
      throw new AppError("Error al intentar egresar al estudiante", 404)
    }

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
  })

   update = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
  
      const id = Number(req.params.id)

      const {egresado: EgresadoData} = req.body as UpdateEgresadoDTO

      const egresado = await EgresadoRepository.update(id, EgresadoData)

      if (!egresado) {
        throw new AppError("Egresado no encontrado o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Egresado actualizado exitosamente",
        data: egresado,
      })
  })

   delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

      const id = Number(req.params.id)
      const egresado = await EgresadoRepository.delete(id)

      if (!egresado) {
        throw new AppError("Egresado no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        message: "Egresado eliminado exitosamente",
      })

  })
}
