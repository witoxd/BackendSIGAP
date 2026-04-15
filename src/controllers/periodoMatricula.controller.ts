import type { Request, Response } from "express"
import { PeriodoMatriculaRepository } from "../models/Repository/PeriodoMatriculaRepository"
import { MatriculaRepository } from "../models/Repository/MatriculaRepository"
import { AppError } from "../utils/AppError"
import { asyncHandler } from "../utils/asyncHandler"
import { transaction } from "../config/database"
import { validationResult } from "express-validator"
import type { CreatePeriodoMatriculaDTO, UpdatePeriodoMatriculaDTO } from "../types"

export class PeriodoMatriculaController {

  // ----------------------------------------------------------
  // getAll — lista todos los períodos ordenados por año desc
  // ----------------------------------------------------------
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const periodos = await PeriodoMatriculaRepository.findAll()

    res.status(200).json({
      success: true,
      data: periodos,
    })
  })

  // ----------------------------------------------------------
  // getActivo — devuelve el período activo actual.
  // El frontend lo usa para saber si el proceso está abierto
  // y mostrar el formulario de matrícula o un mensaje de cierre.
  // ----------------------------------------------------------
  getActivo = asyncHandler(async (_req: Request, res: Response) => {
    const periodo = await PeriodoMatriculaRepository.findActivo()

    res.status(200).json({
      success: true,
      data: periodo ?? null,
      abierto: periodo !== null,
    })
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const periodo = await PeriodoMatriculaRepository.findById(id)

    if (!periodo) throw new AppError("Período de matrícula no encontrado", 404)

    res.status(200).json({ success: true, data: periodo })
  })

  // ----------------------------------------------------------
  // create — crea un período nuevo (siempre inactivo al inicio).
  //
  // Validaciones:
  //   1. No puede solaparse con un período activo en las mismas fechas
  //   2. fecha_fin debe ser >= fecha_inicio (también en BD con CHECK)
  //   3. Solo un período activo a la vez (garantizado por índice parcial)
  // ----------------------------------------------------------
  create = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const { periodo: PeriodoData } = req.body as CreatePeriodoMatriculaDTO
    const userId = req.user!.userId

    // Validar que fecha_fin >= fecha_inicio
    if (new Date(PeriodoData.fecha_fin) < new Date(PeriodoData.fecha_inicio)) {
      throw new AppError("La fecha de fin no puede ser anterior a la fecha de inicio", 400)
    }

    const periodo = await PeriodoMatriculaRepository.create({
      ...PeriodoData,
      activo: false, // Siempre inactivo al crear — se activa explícitamente
      created_by: userId,
    })

    res.status(201).json({
      success: true,
      message: "Período de matrícula creado exitosamente",
      data: periodo,
    })
  })

  // ----------------------------------------------------------
  // activar — habilita el proceso de matrícula.
  //
  // Validaciones antes de activar:
  //   1. El período existe
  //   2. No hay matrículas activas en otro período (el índice
  //      parcial lo garantiza en BD, pero damos mensaje claro)
  //   3. Las fechas del período son válidas respecto a hoy
  // ----------------------------------------------------------
  activar = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const periodo = await PeriodoMatriculaRepository.findById(id)
    if (!periodo) throw new AppError("Período de matrícula no encontrado", 404)

    if (periodo.activo) {
      throw new AppError("Este período ya está activo", 409)
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    // Usa fecha_fin_inscripcion si existe, si no usa fecha_fin del período
    const fechaLimite = periodo.fecha_fin_inscripcion
      ? new Date(periodo.fecha_fin_inscripcion)
      : new Date(periodo.fecha_fin)

    if (fechaLimite < hoy) {
      throw new AppError(
        "No se puede activar un período cuya fecha de cierre de inscripción ya pasó.",
        400
      )
    }

    // Verificar si ya hay un período activo
    // antes de que el índice parcial lance un error crudo de BD
    const periodoActivoActual = await PeriodoMatriculaRepository.findActivo()
    if (periodoActivoActual) {
      throw new AppError(
        `Ya existe un período activo (${periodoActivoActual.anio} - ${periodoActivoActual.descripcion ?? "sin descripción"}). Desactívalo primero.`,
        409
      )
    }

    const periodoActualizado = await PeriodoMatriculaRepository.activar(id)

    res.status(200).json({
      success: true,
      message: "Período de matrícula activado. El proceso de matrícula está abierto.",
      data: periodoActualizado,
    })
  })

  // ----------------------------------------------------------
  // desactivar — cierra el proceso de matrícula manualmente.
  //
  // Las matrículas ya creadas NO se ven afectadas —
  // solo se impide crear nuevas.
  // ----------------------------------------------------------
  desactivar = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const periodo = await PeriodoMatriculaRepository.findById(id)
    if (!periodo) throw new AppError("Período de matrícula no encontrado", 404)

    if (!periodo.activo) {
      throw new AppError("Este período ya está inactivo", 409)
    }

    const periodoActualizado = await PeriodoMatriculaRepository.desactivar(id)

    res.status(200).json({
      success: true,
      message: "Período de matrícula desactivado. No se aceptan nuevas matrículas.",
      data: periodoActualizado,
    })
  })

  // ----------------------------------------------------------
  // update — actualiza datos del período (no el campo activo).
  // Para cambiar activo usar activar/desactivar.
  // ----------------------------------------------------------
  update = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const id = Number(req.params.id)
    const { periodo: PeriodoData } = req.body as UpdatePeriodoMatriculaDTO

    const existente = await PeriodoMatriculaRepository.findById(id)
    if (!existente) throw new AppError("Período de matrícula no encontrado", 404)

    // No permitir cambiar fechas de un período activo con matrículas
    const tieneFechas = PeriodoData.fecha_inicio || PeriodoData.fecha_fin
    if (tieneFechas && existente.activo) {
      const tieneMatriculas = await PeriodoMatriculaRepository.tieneMatriculas(id)
      if (tieneMatriculas) {
        throw new AppError(
          "No se pueden modificar las fechas de un período activo con matrículas registradas",
          409
        )
      }
    }

    // Validar fechas si ambas llegan en el update
    const fechaInicio = PeriodoData.fecha_inicio ?? existente.fecha_inicio
    const fechaFin = PeriodoData.fecha_fin ?? existente.fecha_fin
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      throw new AppError("La fecha de fin no puede ser anterior a la fecha de inicio", 400)
    }

    const actualizado = await PeriodoMatriculaRepository.update(id, PeriodoData)

    res.status(200).json({
      success: true,
      message: "Período de matrícula actualizado exitosamente",
      data: actualizado,
    })
  })

  // ----------------------------------------------------------
  // delete — solo si no tiene matrículas asociadas
  // ----------------------------------------------------------
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const periodo = await PeriodoMatriculaRepository.findById(id)
    if (!periodo) throw new AppError("Período de matrícula no encontrado", 404)

    if (periodo.activo) {
      throw new AppError("No se puede eliminar un período activo. Desactívalo primero.", 409)
    }

    const tieneMatriculas = await PeriodoMatriculaRepository.tieneMatriculas(id)
    if (tieneMatriculas) {
      throw new AppError(
        "No se puede eliminar un período con matrículas registradas",
        409
      )
    }

    await PeriodoMatriculaRepository.delete(id)

    res.status(200).json({
      success: true,
      message: "Período de matrícula eliminado exitosamente",
    })
  })

  // ----------------------------------------------------------
  // verificarVigencia — consulta si el período activo sigue
  // dentro de sus fechas. Si venció, lo desactiva automáticamente.
  //
  // Se puede llamar desde un cron job o desde el endpoint
  // GET /periodos-matricula/vigencia antes de mostrar el formulario.
  // ----------------------------------------------------------
  verificarVigencia = asyncHandler(async (_req: Request, res: Response) => {
    const periodo = await PeriodoMatriculaRepository.findActivo()

    if (!periodo) {
      return res.status(200).json({
        success: true,
        abierto: false,
        mensaje: "No hay período de matrícula activo",
      })
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaCierre = periodo.fecha_fin_inscripcion
      ? new Date(periodo.fecha_fin_inscripcion)
      : new Date(periodo.fecha_fin)

    if (fechaCierre < hoy) {
      await PeriodoMatriculaRepository.desactivar(periodo.periodo_id)
      return res.status(200).json({
        success: true,
        abierto: false,
        mensaje: `El período de matrícula ${periodo.anio} cerró el ${periodo.fecha_fin_inscripcion ?? periodo.fecha_fin}. Fue desactivado automáticamente.`,
        periodo,
      })
    }

    const msRestantes = fechaCierre.getTime() - hoy.getTime()
    const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24))

    res.status(200).json({
      success: true,
      abierto: true,
      dias_restantes: diasRestantes,
      mensaje: `El proceso de matrícula está abierto. Quedan ${diasRestantes} día(s).`,
      periodo,
    })
  })
}
