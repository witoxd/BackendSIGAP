import type { Request, Response } from "express"
import { EstudianteRepository } from "../models/Repository/EstudianteRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { CreateEstudianteDTO, UpdateEstudianteDTO } from "../types"
import { transaction } from "../config/database"

type CreateEstudianteStaticRequest = Request<never, unknown, CreateEstudianteDTO>

type UpdateEstudianteStaticRequest = Request<{id: string}, unknown, UpdateEstudianteDTO>

export class EstudianteController {

   async getAll(req: Request, res: Response) {
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
  }

   async getById(req: Request, res: Response) {
    const  id  = Number(req.params.id)
    const estudiante = await EstudianteRepository.findById(id)

    if (!estudiante) {
      throw new AppError("Estudiante no encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: estudiante,
    })
  }

   async getByDocumento(req: Request, res: Response) {
    const { numero_documento } = req.params

    const estudiante = await EstudianteRepository.findByDocumento(numero_documento as string)

    if (!estudiante) {
      throw new AppError("Estudiante no encontrado", 404)
    }
    

    res.status(200).json({
      success: true,
      data: estudiante,
    })
  }

   async create(req: CreateEstudianteStaticRequest, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const { persona: PersonaData, estudiante: estudianteData } = req.body

    // Validar que no exista documento
    const existingPersona = await PersonaRepository.findByDocumento(PersonaData.numero_documento)
    if (existingPersona) {
      throw new AppError("Ya existe una persona con ese documento", 409)
    }

    const {newPersona, newEstudiante} = await transaction(async (client) => {
    // Crear persona primero
    const newPersona = await PersonaRepository.create(PersonaData, client)

    const existingEstudiante = await EstudianteRepository.findByPersonaId(newPersona.persona_id)

    // Crear estudiante usando persona_id recién creado
    const newEstudiante = await EstudianteRepository.create({
      ...estudianteData,
      persona_id: newPersona.persona_id,
    }, client)

    return {newEstudiante, newPersona}
    })


    // Respuesta
    return res.status(201).json({
      success: true,
      message: "Estudiante creado exitosamente",
      data: {
        persona: newPersona,
        estudiante: newEstudiante,
      },
    })
  }


   async update(req: UpdateEstudianteStaticRequest, res: Response) {
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

    const { persona, estudiante: estudianteData } = req.body

    
        const  updatedEstudiante = await transaction(async (client) => {
    // Si llega persona, actualizar persona
    if (persona) {
      // Validar documento único
      if (persona.numero_documento) {
        const personaConflicto = await PersonaRepository.findByDocumento(persona.numero_documento)
        
        if (personaConflicto && personaConflicto.persona_id !== existing.persona_id) {
          throw new AppError("Ya existe otra persona con ese documento", 409)
        }
      }
       await PersonaRepository.update(existing.persona_id, persona, client)
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
    const updatedPersona = await PersonaRepository.findById(existing.persona_id)

    // 5️⃣ Respuesta final unificada
    return res.status(200).json({
      success: true,
      message: "Estudiante actualizado exitosamente",
      data: {
        persona: updatedPersona,
        estudiante: updatedEstudiante,
      },
    })
  }

  async delete(req: Request, res: Response) {
    const  id  = Number(req.params.id)
    const estudiante = await EstudianteRepository.delete(id)

    if (!estudiante) {
      throw new AppError("Estudiante no encontrado", 404)
    }

    const persona = await PersonaRepository.delete(estudiante.persona_id)

    res.status(200).json({
      success: true,
      data: {estudiante: estudiante,
        persona: persona
       },
      message: "Estudiante eliminado exitosamente",
    })
  }
}
