import type { Request, Response } from "express"
import { AsignacionDocenteRepository } from "../models/Repository/AsignacionDocenteRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { asyncHandler } from "../utils/asyncHandler"

export class AsignacionDocenteController {
  getByCurso = asyncHandler(async (req: Request, res: Response) => {
    const cursoId = Number(req.params.cursoId)
    const periodoId = req.query.periodo_id ? Number(req.query.periodo_id) : undefined
    const asignaciones = await AsignacionDocenteRepository.findByCurso(cursoId, periodoId)
    res.status(200).json({ success: true, data: asignaciones })
  })

  getByProfesor = asyncHandler(async (req: Request, res: Response) => {
    const profesorId = Number(req.params.profesorId)
    const periodoId = req.query.periodo_id ? Number(req.query.periodo_id) : undefined
    const asignaciones = await AsignacionDocenteRepository.findByProfesor(profesorId, periodoId)
    res.status(200).json({ success: true, data: asignaciones })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const { curso_id, profesor_id, periodo_id, materia, horas_semanales } = req.body
    const asignacion = await AsignacionDocenteRepository.create({
      curso_id, profesor_id, periodo_id, materia, horas_semanales,
    })

    res.status(201).json({
      success: true,
      data: asignacion,
      message: "Asignación docente creada exitosamente",
    })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const id = Number(req.params.id)
    const { materia, horas_semanales } = req.body

    const asignacion = await AsignacionDocenteRepository.update(id, { materia, horas_semanales })
    if (!asignacion) throw new AppError("Asignación no encontrada", 404)

    res.status(200).json({ success: true, data: asignacion, message: "Asignación actualizada" })
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const asignacion = await AsignacionDocenteRepository.delete(id)
    if (!asignacion) throw new AppError("Asignación no encontrada", 404)

    res.status(200).json({ success: true, message: "Asignación docente eliminada" })
  })
}
