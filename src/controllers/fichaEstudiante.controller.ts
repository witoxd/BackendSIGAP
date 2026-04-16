import type { Request, Response } from "express"
import { FichaEstudianteRepository } from "../models/Repository/FichaEstudianteRepository"
import { ColegioAnteriorRepository } from "../models/Repository/ColegioAnteriorRepository"
import { ViviendaEstudianteRepository } from "../models/Repository/ViviendaEstudianteRepository"
import { EstudianteRepository } from "../models/Repository/EstudianteRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { transaction } from "../config/database"
import { asyncHandler } from "../utils/asyncHandler"

async function assertEstudianteExists(estudianteId: number) {
  const estudiante = await EstudianteRepository.findById(estudianteId)
  if (!estudiante) throw new AppError("Estudiante no encontrado", 404)
  return estudiante
}

// =============================================================================
// FICHA ESTUDIANTE
// Datos de caracterización: familia, salud, transporte, información escolar.
// Patrón upsert: el formulario se puede llenar parcialmente y guardarse
// varias veces — como auto-guardado de un formulario web largo.
// =============================================================================

export class FichaEstudianteController {

  // GET /fichaEstudiante/:estudianteId
  getByEstudiante = asyncHandler(async (req: Request, res: Response) => {

    const estudianteId = Number(req.params.estudianteId)
    await assertEstudianteExists(estudianteId)

    const ficha = await FichaEstudianteRepository.findByEstudianteId(estudianteId)

    res.status(200).json({
      success: true,
      // null indica que la ficha aún no se ha llenado — el frontend
      // puede mostrar el formulario vacío en lugar de un error 404
      data: ficha ?? null,
    })
  })

  // PUT /fichaEstudiante/:estudianteId
  // Upsert: crea si no existe, actualiza si ya existe
  upsert = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    try {
      const estudianteId = Number(req.params.estudianteId)
      await assertEstudianteExists(estudianteId)

      const { ficha: fichaData } = req.body

      const ficha = await FichaEstudianteRepository.upsert(estudianteId, fichaData)

      res.status(200).json({
        success: true,
        message: "Ficha del estudiante guardada exitosamente",
        data: ficha,
      })
    } catch (error) {
      throw error
    }
  })

  // DELETE /fichaEstudiante/:estudianteId
  delete = asyncHandler(async (req: Request, res: Response) => {

    const estudianteId = Number(req.params.estudianteId)
    await assertEstudianteExists(estudianteId)

    const ficha = await FichaEstudianteRepository.delete(estudianteId)

    if (!ficha) {
      throw new AppError("Ficha no encontrada para este estudiante", 404)
    }

    res.status(200).json({
      success: true,
      message: "Ficha del estudiante eliminada exitosamente",
    })
  }
  )

}

// =============================================================================
// COLEGIOS ANTERIORES
// Lista de instituciones previas del estudiante.
// Tiene dos estrategias de escritura:
//   - create/update/delete: operaciones individuales
//   - replaceAll: reemplaza toda la lista de una vez (útil cuando el frontend
//     maneja la lista localmente y la manda completa al guardar)
// =============================================================================

export class ColegioAnteriorController {

  // GET /colegiosAnteriores/:estudianteId
  getByEstudiante = asyncHandler(async (req: Request, res: Response) => {
    try {
      const estudianteId = Number(req.params.estudianteId)
      await assertEstudianteExists(estudianteId)

      const colegios = await ColegioAnteriorRepository.findByEstudianteId(estudianteId)

      res.status(200).json({
        success: true,
        data: colegios,
      })
    } catch (error) {
      throw error
    }
  })

  // POST /colegiosAnteriores/:estudianteId
  // Agrega un colegio individual a la lista
  create = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }
    const estudianteId = Number(req.params.estudianteId)
    await assertEstudianteExists(estudianteId)

    const { colegio: colegioData } = req.body

    const colegio = await ColegioAnteriorRepository.create({
      ...colegioData,
      estudiante_id: estudianteId,
    })

    res.status(201).json({
      success: true,
      message: "Colegio anterior registrado exitosamente",
      data: colegio,
    })
  })

  // PUT /colegiosAnteriores/:estudianteId/replaceAll
  // Reemplaza TODA la lista del estudiante en una transacción atómica.
  // El frontend manda la lista completa tal como quedó tras la edición.
  // Analogía: como "Guardar como" — reemplaza el archivo completo en lugar
  // de parcharlo línea por línea.
  replaceAll = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    try {
      const estudianteId = Number(req.params.estudianteId)
      await assertEstudianteExists(estudianteId)

      const { colegios } = req.body

      // Transacción garantiza que si el INSERT falla, el DELETE anterior
      // se revierte y el estudiante no queda sin colegios
      const result = await transaction(async (client) => {
        return await ColegioAnteriorRepository.replaceAll(estudianteId, colegios, client)
      })

      res.status(200).json({
        success: true,
        message: "Colegios anteriores actualizados exitosamente",
        data: result,
      })
    } catch (error) {
      throw error
    }
  })

  // PATCH /colegiosAnteriores/:estudianteId/:colegioId
  // Actualiza un colegio individual sin afectar el resto
  update = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const colegioId = Number(req.params.colegioId)
    const estudianteId = Number(req.params.estudianteId)

    // Verificar que el colegio le pertenece al estudiante —
    // mismo patrón que removeFromEstudiante en acudiente.controller
    const existing = await ColegioAnteriorRepository.findById(colegioId)
    if (!existing) {
      throw new AppError("Colegio no encontrado", 404)
    }
    if (existing.estudiante_id !== estudianteId) {
      throw new AppError("El colegio no pertenece a este estudiante", 403)
    }

    const { colegio: colegioData } = req.body
    const updated = await ColegioAnteriorRepository.update(colegioId, colegioData)

    res.status(200).json({
      success: true,
      message: "Colegio actualizado exitosamente",
      data: updated,
    })
  })

  // DELETE /colegiosAnteriores/:estudianteId/:colegioId
  delete = asyncHandler(async (req: Request, res: Response) => {

    const colegioId = Number(req.params.colegioId)
    const estudianteId = Number(req.params.estudianteId)

    const existing = await ColegioAnteriorRepository.findById(colegioId)
    if (!existing) {
      throw new AppError("Colegio no encontrado", 404)
    }
    if (existing.estudiante_id !== estudianteId) {
      throw new AppError("El colegio no pertenece a este estudiante", 403)
    }

    await ColegioAnteriorRepository.delete(colegioId)

    res.status(200).json({
      success: true,
      message: "Colegio anterior eliminado exitosamente"
    })

  }
  )

}

// =============================================================================
// VIVIENDA ESTUDIANTE
// Datos socioeconómicos: tipo de vivienda, materiales, servicios.
// También usa patrón upsert
// =============================================================================

export class ViviendaEstudianteController {

  // GET /viviendaEstudiante/:estudianteId
  getByEstudiante = asyncHandler(async (req: Request, res: Response) => {
    try {
      const estudianteId = Number(req.params.estudianteId)
      await assertEstudianteExists(estudianteId)

      const vivienda = await ViviendaEstudianteRepository.findByEstudianteId(estudianteId)

      res.status(200).json({
        success: true,
        data: vivienda ?? null,
      })
    } catch (error) {
      throw error
    }
  })

  // PUT /viviendaEstudiante/:estudianteId
  upsert = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    try {
      const estudianteId = Number(req.params.estudianteId)
      await assertEstudianteExists(estudianteId)

      const { vivienda: viviendaData } = req.body

      const vivienda = await ViviendaEstudianteRepository.upsert(estudianteId, viviendaData)

      res.status(200).json({
        success: true,
        message: "Datos de vivienda guardados exitosamente",
        data: vivienda,
      })
    } catch (error) {
      throw error
    }
  }
  )

  // DELETE /viviendaEstudiante/:estudianteId
   delete = asyncHandler( async (req: Request, res: Response) => {
    try {
      const estudianteId = Number(req.params.estudianteId)
      await assertEstudianteExists(estudianteId)

      const vivienda = await ViviendaEstudianteRepository.delete(estudianteId)

      if (!vivienda) {
        throw new AppError("Datos de vivienda no encontrados para este estudiante", 404)
      }

      res.status(200).json({
        success: true,
        message: "Datos de vivienda eliminados exitosamente",
      })
    } catch (error) {
      throw error
    }
  })

}

// =============================================================================
// EXPEDIENTE COMPLETO
// Endpoint compuesto que opera sobre las 3 secciones a la vez.
// GET: trae todo en paralelo con Promise.all (1 redondeo de red en lugar de 3).
// PUT: guarda todo en una sola transacción — cada sección es opcional,
//      manda solo lo que cambió.
//
// Analogía: como "Guardar todo" en un IDE — guarda todos los archivos
// abiertos de una sola vez en lugar de uno por uno.
// =============================================================================

export class ExpedienteController {

  // GET /expediente/:estudianteId
   getExpediente = asyncHandler( async (req: Request, res: Response) => {
    try {
      const estudianteId = Number(req.params.estudianteId)
      await assertEstudianteExists(estudianteId)

      // Promise.all ejecuta las 3 consultas en paralelo —
      // el tiempo total es el de la más lenta, no la suma de las 3
      const [ficha, colegios, vivienda] = await Promise.all([
        FichaEstudianteRepository.findByEstudianteId(estudianteId),
        ColegioAnteriorRepository.findByEstudianteId(estudianteId),
        ViviendaEstudianteRepository.findByEstudianteId(estudianteId),
      ])

      res.status(200).json({
        success: true,
        data: {
          ficha: ficha ?? null,
          colegios: colegios ?? [],
          vivienda: vivienda ?? null,
        },
      })
    } catch (error) {
      throw error
    }
  })

  // PUT /expediente/:estudianteId
   upsertExpediente = asyncHandler( async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    try {
      const estudianteId = Number(req.params.estudianteId)
      await assertEstudianteExists(estudianteId)

      const { ficha, colegios, vivienda } = req.body

      const result = await transaction(async (client) => {
        const [fichaResult, colegiosResult, viviendaResult] = await Promise.all([
          ficha ? FichaEstudianteRepository.upsert(estudianteId, ficha, client) : null,
          colegios ? ColegioAnteriorRepository.replaceAll(estudianteId, colegios, client) : null,
          vivienda ? ViviendaEstudianteRepository.upsert(estudianteId, vivienda, client) : null,
        ])

        return { ficha: fichaResult, colegios: colegiosResult, vivienda: viviendaResult }
      })

      res.status(200).json({
        success: true,
        message: "Expediente del estudiante guardado exitosamente",
        data: result,
      })
    } catch (error) {
      throw error
    }
  })

}
