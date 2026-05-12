import type { Request, Response } from "express"
import { ReemplazoProfesorRepository } from "../models/Repository/ReemplazoProfesorRepository"
import { ProfesorRepository } from "../models/Repository/ProfesorRepository"
import { DocenteRepository } from "../models/Repository/DocenteRepository"
import { AppError } from "../utils/AppError"
import { transaction } from "../config/database"
import { asyncHandler } from "../utils/asyncHandler"

export class ReemplazoProfesorController {
  getByProfesor = asyncHandler(async (req: Request, res: Response) => {
    const profesorId = Number(req.params.profesorId)
    const profesor = await ProfesorRepository.findById(profesorId)
    if (!profesor) throw new AppError("Profesor no encontrado", 404)

    const data = await ReemplazoProfesorRepository.findByProfesorId(profesorId)
    res.status(200).json({ success: true, data })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const { profesor_id, reemplaza_a_profesor_id, fecha_inicio, motivo } = req.body as {
      profesor_id:             number
      reemplaza_a_profesor_id: number
      fecha_inicio:            string
      motivo?:                 string
    }

    if (!profesor_id || !reemplaza_a_profesor_id || !fecha_inicio) {
      throw new AppError("profesor_id, reemplaza_a_profesor_id y fecha_inicio son requeridos", 400)
    }
    if (profesor_id === reemplaza_a_profesor_id) {
      throw new AppError("Un profesor no puede reemplazarse a sí mismo", 400)
    }

    const result = await transaction(async (client) => {
      const [reemplazante, reemplazado] = await Promise.all([
        ProfesorRepository.findById(profesor_id),
        ProfesorRepository.findById(reemplaza_a_profesor_id),
      ])
      if (!reemplazante) throw new AppError("Profesor reemplazante no encontrado", 404)
      if (!reemplazado)  throw new AppError("Profesor a reemplazar no encontrado", 404)

      const activo = await ReemplazoProfesorRepository.findActivo(reemplaza_a_profesor_id)
      if (activo) throw new AppError("El profesor ya tiene un reemplazo activo", 409)

      const reemplazo = await ReemplazoProfesorRepository.create(
        { profesor_id, reemplaza_a_profesor_id, fecha_inicio: new Date(fecha_inicio), motivo },
        client
      )

      // Marcar al reemplazado como inactivo
      const docenteReemplazado = (reemplazado as any).docente
      if (docenteReemplazado?.docente_id) {
        await DocenteRepository.updateEstado(docenteReemplazado.docente_id, "inactivo", client)
      }

      return reemplazo
    })

    res.status(201).json({
      success: true,
      data: result,
      message: "Reemplazo registrado exitosamente",
    })
  })

  cerrar = asyncHandler(async (req: Request, res: Response) => {
    const reemplazoId = Number(req.params.id)
    const { fecha_fin } = req.body as { fecha_fin: string }

    if (!fecha_fin) throw new AppError("fecha_fin es requerida", 400)

    const result = await transaction(async (client) => {
      const reemplazo = await ReemplazoProfesorRepository.findById(reemplazoId)
      if (!reemplazo) throw new AppError("Reemplazo no encontrado", 404)
      if (reemplazo.fecha_fin) throw new AppError("El reemplazo ya está cerrado", 409)

      const cerrado = await ReemplazoProfesorRepository.cerrar(reemplazoId, fecha_fin, client)

      // Reactivar al profesor reemplazado
      const reemplazado = await ProfesorRepository.findById(reemplazo.reemplaza_a_profesor_id)
      const docenteId   = (reemplazado as any)?.docente?.docente_id
      if (docenteId) {
        await DocenteRepository.updateEstado(docenteId, "activo", client)
      }

      return cerrado
    })

    res.status(200).json({
      success: true,
      data: result,
      message: "Reemplazo cerrado exitosamente",
    })
  })
}
