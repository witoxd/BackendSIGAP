import type { Request, Response } from "express"
import { AdministrativoRepository } from "../models/Repository/AdministrativoRepository"
import { DocenteRepository } from "../models/Repository/DocenteRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { CreateAdministrativoDTO, UpdateAdministrativoDTO } from "../types"
import { PersonaService } from "../services/persona.service"
import { transaction } from "../config/database"
import { asyncHandler } from "../utils/asyncHandler"

export class AdministrativoController {

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const limit  = Number.parseInt(req.query.limit  as string) || 50
    const offset = Number.parseInt(req.query.offset as string) || 0

    const administrativos = await AdministrativoRepository.findAll(limit, offset)
    const total           = await AdministrativoRepository.count()

    res.status(200).json({
      success: true,
      data: administrativos,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) },
    })
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const administrativo = await AdministrativoRepository.findById(id)

    if (!administrativo) throw new AppError("Administrativo no encontrado", 404)

    res.status(200).json({ success: true, data: administrativo })
  })

  SearchIndex = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const index = req.params.index as string

    if (!index) throw new AppError("Parámetro index requerido", 400)

    const administrativos = await AdministrativoRepository.SearchIndex(index, limit)
    if (!administrativos || administrativos.length === 0) throw new AppError("Administrativo no encontrado", 404)

    res.status(200).json({
      success: true,
      data: administrativos,
      pagination: { total: administrativos.length, limit, pages: Math.ceil(administrativos.length / limit) },
    })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const { persona: personaData, administrativo: administrativoData } = req.body as CreateAdministrativoDTO

    const result = await transaction(async (client) => {
      const persona = await PersonaService.validateOrCreatePersona(personaData, client)

      // Verificar si la persona ya tiene rol administrativo
      const existente = await AdministrativoRepository.findByPersonaId(persona.persona_id)
      if (existente) throw new AppError("La persona ya tiene rol administrativo", 409)

      // Si la persona ya tiene un docente, reutilizarlo; si no, crearlo
      let docente = await DocenteRepository.findByPersonaId(persona.persona_id)
      if (!docente) {
        docente = await DocenteRepository.create(
          {
            persona_id:         persona.persona_id,
            sede:               administrativoData?.sede,
            jornada_id:         administrativoData?.jornada_id,
            tipo_contrato:      administrativoData?.tipo_contrato,
            estado:             administrativoData?.estado ?? "activo",
            fecha_contratacion: administrativoData?.fecha_contratacion ? new Date(administrativoData.fecha_contratacion) : undefined,
          },
          client
        )
      } else if (administrativoData) {
        const docenteFields = ["sede", "jornada_id", "tipo_contrato", "estado", "fecha_contratacion"]
        const update: Record<string, unknown> = {}
        for (const key of docenteFields) {
          if (key in administrativoData) update[key] = (administrativoData as Record<string, unknown>)[key]
        }
        if (Object.keys(update).length > 0) {
          await DocenteRepository.update(docente.docente_id, update as any, client)
        }
      }

      const administrativo = await AdministrativoRepository.create(
        { docente_id: docente.docente_id, cargo: administrativoData?.cargo },
        client
      )

      return { persona, docente, administrativo }
    })

    res.status(201).json({
      success: true,
      data: result,
      message: "Administrativo creado exitosamente",
    })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const administrativoId = Number(req.params.id)
    const existing = await AdministrativoRepository.findById(administrativoId)
    if (!existing) throw new AppError("Administrador no encontrado", 404)

    const { persona: personaData, administrativo: administrativoData } = req.body as UpdateAdministrativoDTO

    await transaction(async (client) => {
      if (personaData) {
        if (personaData.numero_documento) {
          const conflicto = await PersonaRepository.findByDocumento(personaData.numero_documento)
          if (conflicto && conflicto.persona_id !== existing.persona.persona_id) {
            throw new AppError("Ya existe otra persona con ese documento", 409)
          }
        }
        await PersonaRepository.update(existing.persona.persona_id, personaData, client)
      }

      if (administrativoData) {
        // cargo va a la tabla administrativos
        if (administrativoData.cargo !== undefined) {
          await AdministrativoRepository.update(administrativoId, { cargo: administrativoData.cargo }, client)
        }
        // resto de campos van a docente
        const docenteFields = ["sede", "jornada_id", "tipo_contrato", "estado", "fecha_contratacion"]
        const update: Record<string, unknown> = {}
        for (const key of docenteFields) {
          if (key in administrativoData) update[key] = (administrativoData as Record<string, unknown>)[key]
        }
        if (Object.keys(update).length > 0) {
          await DocenteRepository.update(existing.administrativo.docente_id, update as any, client)
        }
      }
    })

    const updated = await AdministrativoRepository.findById(administrativoId)

    res.status(200).json({
      success: true,
      data: updated,
      message: "Administrativo actualizado exitosamente",
    })
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const administrativo = await AdministrativoRepository.delete(id)

    if (!administrativo) throw new AppError("Administrativo no encontrado", 404)

    res.status(200).json({
      success: true,
      data: administrativo,
      message: "Administrativo eliminado exitosamente",
    })
  })
}
