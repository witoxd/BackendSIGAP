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
import { registrarAuditoria } from "../utils/auditoria"
import { ContactoRepository } from "../models/Repository/ContactoRepository"

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

    const {
      persona: personaData,
      administrativo: administrativoData,
      contactos: contactosData = [],
    } = req.body as CreateAdministrativoDTO & { contactos?: any[] }

    if (!contactosData.length) throw new AppError("Se requiere al menos un contacto", 400)

    // Todos los campos de docente que un administrativo puede tener
    const ALL_DOCENTE_FIELDS = [
      "sede", "jornada_id", "tipo_contrato", "estado", "fecha_contratacion",
      "decreto_id", "grado_escalafon_id", "area", "titulo", "posgrado",
      "perfil_profesional", "fecha_nombramiento", "numero_resolucion",
    ]

    const result = await transaction(async (client) => {
      const persona = await PersonaService.validateOrCreatePersona(personaData, client)

      // Verificar si la persona ya tiene rol administrativo
      const existente = await AdministrativoRepository.findByPersonaId(persona.persona_id)
      if (existente) throw new AppError("La persona ya tiene rol administrativo", 409)

      // Si la persona ya tiene un docente (ej: es profesor), reutilizarlo; si no, crearlo
      let docente = await DocenteRepository.findByPersonaId(persona.persona_id)
      if (!docente) {
        const docenteData: Record<string, unknown> = { persona_id: persona.persona_id, estado: administrativoData?.estado ?? "activo" }
        for (const key of ALL_DOCENTE_FIELDS) {
          if (administrativoData && key in administrativoData) {
            const val = (administrativoData as Record<string, unknown>)[key]
            docenteData[key] = key === "fecha_contratacion" || key === "fecha_nombramiento"
              ? (val ? new Date(val as string) : undefined)
              : val
          }
        }
        docente = await DocenteRepository.create(docenteData as any, client)
      } else if (administrativoData) {
        const update: Record<string, unknown> = {}
        for (const key of ALL_DOCENTE_FIELDS) {
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

      await ContactoRepository.bulkCreate(
        contactosData.map((c: any) => ({ ...c, persona_id: persona.persona_id })),
        client
      )

      return { persona, docente, administrativo }
    })

    await registrarAuditoria({
      tabla_nombre: "administrativos",
      accion: "CREATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { administrativoId: result.administrativo.administrativo_id, personaId: result.persona.persona_id },
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
          if (conflicto && conflicto.persona?.persona_id !== existing.persona.persona_id) {
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
        const docenteFields = [
          "sede", "jornada_id", "tipo_contrato", "estado", "fecha_contratacion",
          "decreto_id", "grado_escalafon_id", "area", "titulo", "posgrado",
          "perfil_profesional", "fecha_nombramiento", "numero_resolucion",
        ]
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

    await registrarAuditoria({
      tabla_nombre: "administrativos",
      accion: "UPDATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { administrativoId },
    })

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

    await registrarAuditoria({
      tabla_nombre: "administrativos",
      accion: "DELETE",
      usuario_id: req.user?.userId ?? null,
      detalle: { administrativoId: id },
    })

    res.status(200).json({
      success: true,
      data: administrativo,
      message: "Administrativo eliminado exitosamente",
    })
  })
}
