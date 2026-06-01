import type { Request, Response } from "express"
import { EstudianteRepository } from "../models/Repository/EstudianteRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { EgresadoRepository } from "../models/Repository/EgresadoRepository"
import { SuspensionRepository } from "../models/Repository/SuspensionRepository"
import { MatriculaRepository } from "../models/Repository/MatriculaRepository"
import { CreateEstudianteDTO, UpdateEstudianteDTO } from "../types"
import { transaction } from "../config/database"
import { asyncHandler } from "../utils/asyncHandler"
import { registrarAuditoria } from "../utils/auditoria"


export class EstudianteController {

   getAll = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const offset = Number.parseInt(req.query.offset as string) || 0

    const estudiantes = await EstudianteRepository.findAll(limit, offset)
    const total = await EstudianteRepository.count()

    res.status(200).json({
      success: true,
      data: estudiantes,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    })
  })

   getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const estudiante = await EstudianteRepository.findById(id)

    if (!estudiante) {
      throw new AppError("Estudiante no encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: estudiante,
    })
  })

   getByDocumento = asyncHandler(async (req: Request, res: Response) => {
    const { numero_documento } = req.params

    const estudiante = await EstudianteRepository.findByDocumento(numero_documento as string)

    if (!estudiante) {
      throw new AppError("Estudiante no encontrado", 404)
    }


    res.status(200).json({
      success: true,
      data: estudiante,
    })
  })

   SearchIndex = asyncHandler( async (req: Request, res: Response) => {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const index = req.params.index as string

    if (!index) {
      throw new AppError("Parámetro index requerido", 400)
    }

    const estudiantes = await EstudianteRepository.SearchIndex(index, limit)


    res.status(200).json({
      success: true,
      data: estudiantes,
      pagination: {
        total: estudiantes.length,
        limit,
        pages: Math.ceil(estudiantes.length / limit),
      },
    })
  })

   create = asyncHandler( async (req: Request, res: Response)  =>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const { persona: PersonaData, estudiante: _estudianteData } = req.body as CreateEstudianteDTO

    // Validar que no exista documento
    const existingPersona = await PersonaRepository.findByDocumento(PersonaData.numero_documento)
    if (existingPersona) {
      throw new AppError("Ya existe una persona con ese documento", 409)
    }

    const { newPersona, newEstudiante } = await transaction(async (client) => {
      // Crear persona primero
      const newPersona = await PersonaRepository.create(PersonaData, client)

      // Crear estudiante usando persona_id recién creado
      // estado e fecha_ingreso se ignoran del body — el repo aplica los defaults
      const newEstudiante = await EstudianteRepository.create({
        persona_id: newPersona.persona_id,
      }, client)

      return { newEstudiante, newPersona }
    })


    await registrarAuditoria({
      tabla_nombre: "estudiantes",
      accion: "CREATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { estudianteId: newEstudiante.estudiante_id, personaId: newPersona.persona_id },
    })

    return res.status(201).json({
      success: true,
      message: "Estudiante creado exitosamente",
      data: {
        persona: newPersona,
        estudiante: newEstudiante,
      },
    })
  })


   update = asyncHandler( async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const estudianteId = Number(req.params.id)

    // Buscar estudiante existente

    const existing = await EstudianteRepository.findById(estudianteId)
    if (!existing) {
      throw new AppError("Estudiante no encontrado", 404)
    }

    const { persona: personaData, estudiante: estudianteData } = req.body as UpdateEstudianteDTO


    const updatedEstudiante = await transaction(async (client) => {
      // Si llega persona, actualizar persona
      if (personaData) {
        // Validar documento único
        if (personaData.numero_documento) {
          const personaConflicto = await PersonaRepository.findByDocumento(personaData.numero_documento)

          if (personaConflicto && personaConflicto.persona_id !== existing.persona_id) {
            throw new AppError("Ya existe otra persona con ese documento", 409)
          }
        }
        await PersonaRepository.update(existing.persona.persona_id, personaData, client)
      }

      // Si llegan datos del estudiante, actualizarlos
      let updatedEstudiante = null
      if (estudianteData && Object.keys(estudianteData).length > 0) {
        updatedEstudiante = await EstudianteRepository.update(estudianteId, estudianteData, client)
      } else {
        updatedEstudiante = await EstudianteRepository.findById(estudianteId)
      }

      return updatedEstudiante

    })

    // Obtener persona actualizada
    const updatedPersona = await PersonaRepository.findById(existing.persona.persona_id)

    await registrarAuditoria({
      tabla_nombre: "estudiantes",
      accion: "UPDATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { estudianteId },
    })

    return res.status(200).json({
      success: true,
      message: "Estudiante actualizado exitosamente",
      data: {
        persona: updatedPersona,
        estudiante: updatedEstudiante,
      },
    })
  })

   delete = asyncHandler( async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const estudiante = await EstudianteRepository.delete(id)

    if (!estudiante) {
      throw new AppError("Estudiante no encontrado", 404)
    }

    const persona = await PersonaRepository.delete(estudiante.persona_id)

    await registrarAuditoria({
      tabla_nombre: "estudiantes",
      accion: "DELETE",
      usuario_id: req.user?.userId ?? null,
      detalle: { estudianteId: id },
    })

    res.status(200).json({
      success: true,
      data: {
        estudiante: estudiante,
        persona: persona
      },
      message: "Estudiante eliminado exitosamente",
    })
  })

   getEstudiantesByAcudiente = asyncHandler(async (req: Request, res: Response) => {
    const acudienteId = Number(req.params.id)
    const estudiantes = await EstudianteRepository.getEstudiantesByAcudiente(acudienteId)

    res.status(200).json({
      success: true,
      data: estudiantes,
    })
  })

  // -------------------------------------------------------------------------
  // suspender — crea una suspensión temporal. No persiste estado en estudiante.
  // -------------------------------------------------------------------------
  suspender = asyncHandler(async (req: Request, res: Response) => {
    const estudianteId = Number(req.params.id)
    const { motivo, fecha_inicio, fecha_fin } = req.body

    if (!motivo || !fecha_inicio || !fecha_fin) {
      throw new AppError("motivo, fecha_inicio y fecha_fin son requeridos", 400)
    }
    if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
      throw new AppError("fecha_fin debe ser posterior a fecha_inicio", 400)
    }

    const estudiante = await EstudianteRepository.findById(estudianteId)
    if (!estudiante) throw new AppError("Estudiante no encontrado", 404)

    const estadoActual = estudiante.estudiante.estado
    if (estadoActual === "expulsado") throw new AppError("No se puede suspender a un estudiante expulsado", 409)
    if (estadoActual === "graduado")  throw new AppError("No se puede suspender a un estudiante egresado", 409)

    const suspension = await SuspensionRepository.create({
      estudiante_id: estudianteId,
      motivo,
      fecha_inicio,
      fecha_fin,
      creado_por: req.user?.userId ?? null,
    })

    await registrarAuditoria({
      tabla_nombre: "estudiantes",
      accion: "UPDATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { estudianteId, operacion: "suspender", fecha_inicio, fecha_fin, motivo },
    })

    res.status(201).json({ success: true, message: "Suspensión registrada", data: suspension })
  })

  // -------------------------------------------------------------------------
  // expulsar — marca estado=expulsado y retira la matrícula activa si existe.
  // -------------------------------------------------------------------------
  expulsar = asyncHandler(async (req: Request, res: Response) => {
    const estudianteId = Number(req.params.id)
    const { motivo } = req.body

    if (!motivo) throw new AppError("motivo es requerido", 400)

    const estudiante = await EstudianteRepository.findById(estudianteId)
    if (!estudiante) throw new AppError("Estudiante no encontrado", 404)

    const estadoActual = estudiante.estudiante.estado
    if (estadoActual === "expulsado") throw new AppError("El estudiante ya está expulsado", 409)
    if (estadoActual === "graduado")  throw new AppError("No se puede expulsar a un estudiante egresado", 409)

    await transaction(async (client) => {
      // Retirar matrícula activa si existe
      const matriculas = await MatriculaRepository.findByEstudiante(estudianteId)
      const activa = matriculas.find((m: any) => m.estado_actual === "activa")
      if (activa) {
        await MatriculaRepository.retirar(activa.matricula_id, `Expulsión: ${motivo}`, client)
      }
      await EstudianteRepository.update(estudianteId, { estado: "expulsado" }, client)
    })

    await registrarAuditoria({
      tabla_nombre: "estudiantes",
      accion: "UPDATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { estudianteId, operacion: "expulsar", motivo },
    })

    res.status(200).json({ success: true, message: "Estudiante expulsado" })
  })

  // -------------------------------------------------------------------------
  // reactivar — revierte expulsión (solo admin). Vuelve a estado activo/inactivo.
  // -------------------------------------------------------------------------
  reactivar = asyncHandler(async (req: Request, res: Response) => {
    const estudianteId = Number(req.params.id)

    const estudiante = await EstudianteRepository.findById(estudianteId)
    if (!estudiante) throw new AppError("Estudiante no encontrado", 404)

    if (estudiante.estudiante.estado !== "expulsado") {
      throw new AppError("Solo se puede reactivar un estudiante expulsado", 409)
    }

    await EstudianteRepository.update(estudianteId, { estado: "activo" })

    await registrarAuditoria({
      tabla_nombre: "estudiantes",
      accion: "UPDATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { estudianteId, operacion: "reactivar" },
    })

    res.status(200).json({ success: true, message: "Expulsión revertida, estudiante reactivado" })
  })

  // -------------------------------------------------------------------------
  // egresar — crea registro en egresados y cambia estado a graduado.
  // -------------------------------------------------------------------------
  egresar = asyncHandler(async (req: Request, res: Response) => {
    const estudianteId = Number(req.params.id)
    const { fecha_grado } = req.body

    const estudiante = await EstudianteRepository.findById(estudianteId)
    if (!estudiante) throw new AppError("Estudiante no encontrado", 404)

    const estadoActual = estudiante.estudiante.estado
    if (estadoActual === "graduado")  throw new AppError("El estudiante ya está egresado", 409)
    if (estadoActual === "expulsado") throw new AppError("No se puede egresar a un estudiante expulsado", 409)

    const yaEgresado = await EgresadoRepository.findByEstudianteId(estudianteId)
    if (yaEgresado) throw new AppError("Ya existe un registro de egresado para este estudiante", 409)

    const egresado = await transaction(async (client) => {
      // Retirar matrícula activa si existe
      const matriculas = await MatriculaRepository.findByEstudiante(estudianteId)
      const activa = matriculas.find((m: any) => m.estado_actual === "activa")
      if (activa) {
        await MatriculaRepository.retirar(activa.matricula_id, "Egresado", client)
      }
      return EgresadoRepository.create(
        { estudiante_id: estudianteId, fecha_grado: fecha_grado || new Date() },
        client
      )
    })

    await registrarAuditoria({
      tabla_nombre: "estudiantes",
      accion: "UPDATE",
      usuario_id: req.user?.userId ?? null,
      detalle: { estudianteId, operacion: "egresar", fecha_grado: fecha_grado || new Date() },
    })

    res.status(201).json({ success: true, message: "Estudiante egresado exitosamente", data: egresado })
  })

  // -------------------------------------------------------------------------
  // getSuspensiones — lista todas las suspensiones de un estudiante.
  // -------------------------------------------------------------------------
  getSuspensiones = asyncHandler(async (req: Request, res: Response) => {
    const estudianteId = Number(req.params.id)
    const suspensiones = await SuspensionRepository.findByEstudiante(estudianteId)
    res.status(200).json({ success: true, data: suspensiones })
  })

  // -------------------------------------------------------------------------
  // deleteSuspension — elimina una suspensión específica.
  // -------------------------------------------------------------------------
  deleteSuspension = asyncHandler(async (req: Request, res: Response) => {
    const suspensionId = Number(req.params.suspensionId)
    const deleted = await SuspensionRepository.delete(suspensionId)
    if (!deleted) throw new AppError("Suspensión no encontrada", 404)
    res.status(200).json({ success: true, message: "Suspensión eliminada" })
  })

}
