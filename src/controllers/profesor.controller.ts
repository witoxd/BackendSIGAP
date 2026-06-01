import type { Request, Response } from "express"
import { ProfesorRepository } from "../models/Repository/ProfesorRepository"
import { DocenteRepository } from "../models/Repository/DocenteRepository"
import { ProfesorContactoEmergenciaRepository } from "../models/Repository/ProfesorContactoEmergenciaRepository"
import { ContactoRepository } from "../models/Repository/ContactoRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { CreateProfesorDTO, UpdateProfesorDTO } from "../types"
import { transaction } from "../config/database"
import { PersonaService } from "../services/persona.service"
import { asyncHandler } from "../utils/asyncHandler"
import { registrarAuditoria } from "../utils/auditoria"

export class ProfesorController {

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const limit  = Number.parseInt(req.query.limit  as string) || 50
    const offset = Number.parseInt(req.query.offset as string) || 0

    const profesores = await ProfesorRepository.findAll(limit, offset)
    const total      = await ProfesorRepository.count()

    res.status(200).json({
      success: true,
      data: profesores,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) },
    })
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const profesor = await ProfesorRepository.findById(Number(req.params.id))
    if (!profesor) throw new AppError("Profesor no encontrado", 404)
    res.status(200).json({ success: true, data: profesor })
  })

  getDetalles = asyncHandler(async (req: Request, res: Response) => {
    const detalles = await ProfesorRepository.findDetalles(Number(req.params.id))
    if (!detalles) throw new AppError("Profesor no encontrado", 404)
    res.status(200).json({ success: true, data: detalles })
  })

  SearchIndex = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const index = req.params.index as string

    if (!index) throw new AppError("Parámetro index requerido", 400)

    const profesores = await ProfesorRepository.SearchIndex(index, limit)
    if (!profesores || profesores.length === 0) throw new AppError("Profesor no encontrado", 404)

    res.status(200).json({
      success: true,
      data: profesores,
      pagination: { total: profesores.length, limit, pages: Math.ceil(profesores.length / limit) },
    })
  })

  // Crea persona + docente + profesor + contactos + contacto de emergencia en una sola transacción.
  create = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const {
      persona: personaData,
      profesor: profesorData,
      contactos: contactosData = [],
      contacto_emergencia: emergenciaData,
    } = req.body as CreateProfesorDTO

    if (!contactosData.length) throw new AppError("Se requiere al menos un contacto", 400)
    if (!emergenciaData)       throw new AppError("El contacto de emergencia es requerido", 400)

    const result = await transaction(async (client) => {
      const persona = await PersonaService.validateOrCreatePersona(personaData, client)

      const existingDocente = await DocenteRepository.findByPersonaId(persona.persona_id)
      if (existingDocente) {
        // La persona ya tiene docente — verificar que no sea ya profesor
        const existingProfesor = await ProfesorRepository.findByPersonaId(persona.persona_id)
        if (existingProfesor) throw new AppError("Esta persona ya está registrada como profesor", 409)

        // Actualizar docente con campos académicos y crear solo el registro marcador de profesor
        await DocenteRepository.update(
          existingDocente.docente_id,
          {
            decreto_id:          profesorData.decreto_id,
            titulo:              profesorData.titulo,
            area:                profesorData.area,
            posgrado:            profesorData.posgrado,
            grado_escalafon_id:  profesorData.grado_escalafon_id,
            fecha_nombramiento:  profesorData.fecha_nombramiento ? new Date(profesorData.fecha_nombramiento) : undefined,
            numero_resolucion:   profesorData.numero_resolucion,
            perfil_profesional:  profesorData.perfil_profesional,
          },
          client
        )
        const profesor = await ProfesorRepository.create({ docente_id: existingDocente.docente_id }, client)
        const emergencia = await ProfesorContactoEmergenciaRepository.create(
          { ...emergenciaData, profesor_id: profesor.profesor_id },
          client
        )
        return { persona, docente: existingDocente, profesor, emergencia }
      }

      // Caso normal: crear docente + profesor
      const docente = await DocenteRepository.create(
        {
          persona_id:         persona.persona_id,
          sede:               profesorData.sede,
          jornada_id:         profesorData.jornada_id,
          tipo_contrato:      profesorData.tipo_contrato,
          estado:             profesorData.estado ?? "activo",
          fecha_contratacion: profesorData.fecha_contratacion ? new Date(profesorData.fecha_contratacion) : undefined,
          decreto_id:          profesorData.decreto_id,
          titulo:              profesorData.titulo,
          area:                profesorData.area,
          posgrado:            profesorData.posgrado,
          grado_escalafon_id:  profesorData.grado_escalafon_id,
          fecha_nombramiento:  profesorData.fecha_nombramiento ? new Date(profesorData.fecha_nombramiento) : undefined,
          numero_resolucion:   profesorData.numero_resolucion,
          perfil_profesional:  profesorData.perfil_profesional,
        },
        client
      )

      const profesor = await ProfesorRepository.create({ docente_id: docente.docente_id }, client)

      await ContactoRepository.bulkCreate(
        contactosData.map((c: any) => ({ ...c, persona_id: persona.persona_id })),
        client
      )

      const emergencia = await ProfesorContactoEmergenciaRepository.create(
        { ...emergenciaData, profesor_id: profesor.profesor_id },
        client
      )

      return { persona, docente, profesor, emergencia }
    })

    await registrarAuditoria({
      tabla_nombre: "profesores",
      accion: "CREATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { profesorId: result.profesor.profesor_id, personaId: result.persona.persona_id },
    })

    res.status(201).json({
      success: true,
      data: result,
      message: "Profesor creado exitosamente",
    })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const profesorId = Number(req.params.id)
    const existing = await ProfesorRepository.findDetalles(profesorId)
    if (!existing) throw new AppError("No existe este profesor", 404)

    const { persona: personaData, profesor: profesorData } = req.body as UpdateProfesorDTO

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

      if (profesorData) {
        // Todos los campos van a docente (incluidos los académicos)
        const docenteFields = ["sede", "jornada_id", "tipo_contrato", "estado", "fecha_contratacion", "decreto_id", "titulo", "area", "posgrado", "grado_escalafon_id", "fecha_nombramiento", "numero_resolucion", "perfil_profesional"]
        const docenteUpdate: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(profesorData)) {
          if (docenteFields.includes(key)) docenteUpdate[key] = value
        }

        if (Object.keys(docenteUpdate).length > 0) {
          await DocenteRepository.update(existing.docente.docente_id, docenteUpdate as any, client)
        }
      }
    })

    const updated = await ProfesorRepository.findDetalles(profesorId)

    await registrarAuditoria({
      tabla_nombre: "profesores",
      accion: "UPDATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { profesorId },
    })

    res.status(200).json({
      success: true,
      data: updated,
      message: "Profesor actualizado exitosamente",
    })
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const profesor = await ProfesorRepository.delete(id)
    if (!profesor) throw new AppError("Profesor no encontrado", 404)

    await registrarAuditoria({
      tabla_nombre: "profesores",
      accion: "DELETE",
      usuario_id: req.user?.userId ?? null,
      detalle: { profesorId: id },
    })

    res.status(200).json({ success: true, data: profesor, message: "Profesor eliminado exitosamente" })
  })
}
