import type { Request, Response } from "express"
import { GradoEscalafonRepository } from "../models/Repository/GradoEscalafonRepository"
import { AppError } from "../utils/AppError"
import { asyncHandler } from "../utils/asyncHandler"
import type { CreateGradoEscalafonDTO, UpdateGradoEscalafonDTO } from "../types"

export class GradoEscalafonController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const grados = await GradoEscalafonRepository.findAll()
    res.status(200).json({ success: true, data: grados })
  })

  getByDecretoId = asyncHandler(async (req: Request, res: Response) => {
    const decretoId = Number(req.params.decretoId)
    const grados = await GradoEscalafonRepository.findByDecretoId(decretoId)
    res.status(200).json({ success: true, data: grados })
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const grado = await GradoEscalafonRepository.findById(id)
    if (!grado) throw new AppError("Grado de escalafón no encontrado", 404)
    res.status(200).json({ success: true, data: grado })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const { grado } = req.body as CreateGradoEscalafonDTO
    const created = await GradoEscalafonRepository.create(grado)
    res.status(201).json({ success: true, message: "Grado creado exitosamente", data: created })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { grado } = req.body as UpdateGradoEscalafonDTO
    const updated = await GradoEscalafonRepository.update(id, grado)
    if (!updated) throw new AppError("Grado no encontrado o sin cambios", 404)
    res.status(200).json({ success: true, message: "Grado actualizado exitosamente", data: updated })
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const deleted = await GradoEscalafonRepository.delete(id)
    if (!deleted) throw new AppError("Grado no encontrado", 404)
    res.status(200).json({ success: true, message: "Grado eliminado exitosamente" })
  })
}
