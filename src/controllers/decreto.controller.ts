import type { Request, Response } from "express"
import { DecretoRepository } from "../models/Repository/DecretoRepository"
import { AppError } from "../utils/AppError"
import { asyncHandler } from "../utils/asyncHandler"
import type { CreateDecretoDTO, UpdateDecretoDTO } from "../types"

export class DecretoController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const decretos = await DecretoRepository.findAll()
    res.status(200).json({ success: true, data: decretos })
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const decreto = await DecretoRepository.findById(id)
    if (!decreto) throw new AppError("Decreto no encontrado", 404)
    res.status(200).json({ success: true, data: decreto })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const { decreto } = req.body as CreateDecretoDTO
    const created = await DecretoRepository.create(decreto)
    res.status(201).json({ success: true, message: "Decreto creado exitosamente", data: created })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { decreto } = req.body as UpdateDecretoDTO
    const updated = await DecretoRepository.update(id, decreto)
    if (!updated) throw new AppError("Decreto no encontrado o sin cambios", 404)
    res.status(200).json({ success: true, message: "Decreto actualizado exitosamente", data: updated })
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const deleted = await DecretoRepository.delete(id)
    if (!deleted) throw new AppError("Decreto no encontrado", 404)
    res.status(200).json({ success: true, message: "Decreto eliminado exitosamente" })
  })
}
