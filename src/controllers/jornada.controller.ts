import type { Request, Response } from "express"
import { JornadaRepository } from "../models/Repository/JornadaRepository"
import { AppError } from "../utils/AppError"
import { CreateJornadaDTO, UpdateJornadDTO } from "../types"
import { asyncHandler } from "../utils/asyncHandler"


type CreateJornadaStaticRequest = Request<never, unknown, CreateJornadaDTO>

export class JornadaController {

   getAll = asyncHandler( async (req: Request, res: Response)  => {

      const jornadas = await JornadaRepository.findAll()

      res.status(200).json({
        success: true,
        data: jornadas,
      })

  })

   getById = asyncHandler( async (req: Request, res: Response) => {

      const id = Number(req.params.id)
      const jornada = await JornadaRepository.findById(id)

      if (!jornada) {
        throw new AppError("Jornada no encontrada", 404)
      }

      res.status(200).json({
        success: true,
        data: jornada,
      })

  })

   create = asyncHandler(async (req: Request, res: Response) => {

    const {jornada: Jornada} = req.body as CreateJornadaDTO

      const jornada = await JornadaRepository.create(Jornada)

      res.status(201).json({
        success: true,
        message: "Jornada creada exitosamente",
        data: jornada,
      })

  })

   update = (async (req: Request, res: Response) => {

      const id = Number(req.params.id)

      const {jornada: updateJornada} = req.body as UpdateJornadDTO
      
      const jornada = await JornadaRepository.update(id, updateJornada)

      if (!jornada) {
        throw new AppError("Jornada no encontrada o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Jornada actualizada exitosamente",
        data: jornada,
      })
  })

   delete = ( async (req: Request, res: Response) => {

      const id = Number(req.params.id)
      const jornada = await JornadaRepository.delete(id)

      if (!jornada) {
        throw new AppError("Jornada no encontrada", 404)
      }

      res.status(200).json({
        success: true,
        message: "Jornada eliminada exitosamente",
      })
  })
  
}
