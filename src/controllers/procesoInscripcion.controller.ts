import type { Request, Response } from "express"
import { ProcesoInscripcionRepository } from "../models/Repository/ProcesoInscripcionRepository"
import { PeriodoMatriculaRepository } from "../models/Repository/PeriodoMatriculaRepository"
import { AppError } from "../utils/AppError"
import { asyncHandler } from "../utils/asyncHandler"
import { validationResult } from "express-validator"
import type { CreateProcesoInscripcionDTO, UpdateProcesoInscripcionDTO } from "../types"

export class ProcesoInscripcionController {

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const procesos = await ProcesoInscripcionRepository.findAll()
    res.status(200).json({ success: true, data: procesos })
  })

  getByPeriodo = asyncHandler(async (req: Request, res: Response) => {
    const periodoId = Number(req.params.periodoId)
    const procesos = await ProcesoInscripcionRepository.findByPeriodo(periodoId)
    res.status(200).json({ success: true, data: procesos })
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const proceso = await ProcesoInscripcionRepository.findById(id)
    if (!proceso) throw new AppError("Proceso de inscripción no encontrado", 404)
    res.status(200).json({ success: true, data: proceso })
  })

  // ----------------------------------------------------------
  // getVigente — proceso cuya ventana de fechas incluye hoy,
  // dentro del período activo. El frontend lo usa para saber
  // qué tipo de inscripción está abierta en este momento.
  // ----------------------------------------------------------
  getVigente = asyncHandler(async (_req: Request, res: Response) => {
    const proceso = await ProcesoInscripcionRepository.findVigente()
    res.status(200).json({
      success: true,
      data: proceso ?? null,
      abierto: proceso !== null,
    })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const { proceso: data } = req.body as CreateProcesoInscripcionDTO

    const periodo = await PeriodoMatriculaRepository.findById(data.periodo_id)
    if (!periodo) throw new AppError("Período de matrícula no encontrado", 404)

    if (new Date(data.fecha_fin_inscripcion) < new Date(data.fecha_inicio_inscripcion)) {
      throw new AppError("La fecha de fin no puede ser anterior a la fecha de inicio", 400)
    }

    // Las fechas del proceso deben estar dentro del período
    if (
      new Date(data.fecha_inicio_inscripcion) < new Date(periodo.fecha_inicio) ||
      new Date(data.fecha_fin_inscripcion) > new Date(periodo.fecha_fin)
    ) {
      throw new AppError(
        `Las fechas del proceso deben estar dentro del período (${periodo.fecha_inicio} – ${periodo.fecha_fin})`,
        400
      )
    }

    const proceso = await ProcesoInscripcionRepository.create(data)

    res.status(201).json({
      success: true,
      message: "Proceso de inscripción creado exitosamente",
      data: proceso,
    })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const id = Number(req.params.id)
    const { proceso: data } = req.body as UpdateProcesoInscripcionDTO

    const existente = await ProcesoInscripcionRepository.findById(id)
    if (!existente) throw new AppError("Proceso de inscripción no encontrado", 404)

    const fechaInicio = data.fecha_inicio_inscripcion ?? existente.fecha_inicio_inscripcion
    const fechaFin = data.fecha_fin_inscripcion ?? existente.fecha_fin_inscripcion

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      throw new AppError("La fecha de fin no puede ser anterior a la fecha de inicio", 400)
    }

    const periodoId = data.periodo_id ?? existente.periodo_id
    const periodo = await PeriodoMatriculaRepository.findById(periodoId)
    if (!periodo) throw new AppError("Período de matrícula no encontrado", 404)

    if (
      new Date(fechaInicio) < new Date(periodo.fecha_inicio) ||
      new Date(fechaFin) > new Date(periodo.fecha_fin)
    ) {
      throw new AppError(
        `Las fechas del proceso deben estar dentro del período (${periodo.fecha_inicio} – ${periodo.fecha_fin})`,
        400
      )
    }

    const actualizado = await ProcesoInscripcionRepository.update(id, data)

    res.status(200).json({
      success: true,
      message: "Proceso de inscripción actualizado exitosamente",
      data: actualizado,
    })
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const proceso = await ProcesoInscripcionRepository.findById(id)
    if (!proceso) throw new AppError("Proceso de inscripción no encontrado", 404)

    await ProcesoInscripcionRepository.delete(id)

    res.status(200).json({
      success: true,
      message: "Proceso de inscripción eliminado exitosamente",
    })
  })
}
