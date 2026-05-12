import type { Request, Response } from "express"
import { DirectorGrupoRepository } from "../models/Repository/DirectorGrupoRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { asyncHandler } from "../utils/asyncHandler"

export class DirectorGrupoController {
  getByCurso = asyncHandler(async (req: Request, res: Response) => {
    const cursoId = Number(req.params.cursoId)
    const directores = await DirectorGrupoRepository.findByCurso(cursoId)
    res.status(200).json({ success: true, data: directores })
  })

  getByPeriodo = asyncHandler(async (req: Request, res: Response) => {
    const periodoId = Number(req.params.periodoId)
    const directores = await DirectorGrupoRepository.findByPeriodo(periodoId)
    res.status(200).json({ success: true, data: directores })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const { curso_id, periodo_id, profesor_id } = req.body
    const director = await DirectorGrupoRepository.create({ curso_id, periodo_id, profesor_id })

    res.status(201).json({
      success: true,
      data: director,
      message: "Director de grupo asignado exitosamente",
    })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const id = Number(req.params.id)
    const { profesor_id } = req.body

    const director = await DirectorGrupoRepository.update(id, { profesor_id })
    if (!director) throw new AppError("Registro no encontrado", 404)

    res.status(200).json({ success: true, data: director, message: "Director actualizado" })
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const director = await DirectorGrupoRepository.delete(id)
    if (!director) throw new AppError("Registro no encontrado", 404)

    res.status(200).json({ success: true, message: "Director de grupo eliminado" })
  })
}
