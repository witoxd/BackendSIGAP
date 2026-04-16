import type { Request, Response } from "express"
import { AuditoriaRepository } from "../models/Repository/AuditoriaRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"
import { asyncHandler } from "../utils/asyncHandler"

export class AuditoriaController {

  getAll = asyncHandler(async (req: Request, res: Response) => {
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
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const auditoria = await AuditoriaRepository.findById(id)

    if (!auditoria) {
      throw new AppError("Registro de auditoría no encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: auditoria,
    })
  })

  getByUsuarioId = asyncHandler(async (req: Request, res: Response) => {
    const { usuario_id, page, limit } = req.query
    const { limit: pLimit, offset } = getPagination(page as string, limit as string)

    if (!usuario_id) {
      throw new AppError("El usuario_id es requerido", 400)
    }

    const auditorias = await AuditoriaRepository.findByUsuarioId(
      Number.parseInt(usuario_id as string),
      pLimit,
      offset
    )

    res.status(200).json({
      success: true,
      data: auditorias,
    })
  })

  getByAccion = asyncHandler(async (req: Request, res: Response) => {
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
  })

  getByTabla = asyncHandler(async (req: Request, res: Response) => {
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
  })

}