import type { Request, Response } from "express"
import { ProfesorRepository } from "../models/Repository/ProfesorRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { CreateProfesorDTO, UpdateProfesorDTO, CreateAssingProfesorDTO } from "../types"
import { transaction } from "../config/database"
import { PersonaService } from "../services/persona.service"


type CreateProfesorStaticRequest = Request<never, unknown, CreateProfesorDTO>

export class ProfesorController {
  async getAll(req: Request, res: Response) {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const offset = Number.parseInt(req.query.offset as string) || 0

    const profesores = await ProfesorRepository.findAll(limit, offset)
    const total = await ProfesorRepository.count()

    res.status(200).json({
      success: true,
      data: profesores,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    })
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const profesor = await ProfesorRepository.findById(Number(id))

    if (!profesor) {
      throw new AppError("Profesor no encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: profesor,
    })
  }



  async create(req: CreateProfesorStaticRequest, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const { persona: PersonaData, profesor: ProfesorData } = req.body



    const { newPersona, newProfesor } = await transaction(async (client) => {

      const newPersona = await PersonaService.validateOrCreatePersona(PersonaData, client)

      const existingProfesor = await ProfesorRepository.findByPersonaId(newPersona.persona_id)
  
      if(existingProfesor){
        throw new AppError("Ya la persona es profesor", 404)
      }

      const newProfesor = await ProfesorRepository.create({ ...ProfesorData, persona_id: newPersona.persona_id }, client)

      return { newPersona, newProfesor }
    })
    res.status(201).json({
      success: true,
      data: {
        persona: newPersona,
        profesor: newProfesor
      },
      message: "Profesor creado exitosamente",
    })
  }


  async update(req: Request<{ id: string }, unknown, UpdateProfesorDTO>,
    res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const ProfesorId = Number(req.params.id)


    const existingProfesor = await ProfesorRepository.findById(ProfesorId)
    if (!existingProfesor) {
      throw new AppError("No existe este profesor", 404)
    }

    const { persona: PersonaData, profesor: profesorData } = req.body

    const  updateProfesor  = await transaction(async (client) => {

      if (PersonaData) {
        // Validar documento único
        if (PersonaData.numero_documento) {
          const personaConflicto = await PersonaRepository.findByDocumento(PersonaData.numero_documento)

          if (personaConflicto && personaConflicto.persona_id !== existingProfesor.persona_id) {
            throw new AppError("Ya existe otra persona con ese documento", 409)
          }
        }

         await PersonaRepository.update(existingProfesor.persona_id, PersonaData, client)
      }
      let updateProfesor = null
      if (PersonaData) {
        updateProfesor = await ProfesorRepository.update(ProfesorId, profesorData, client)
      } else {
        updateProfesor = await ProfesorRepository.findById(ProfesorId)
      }

      return  updateProfesor 

    })

    const updatePersona = await PersonaRepository.findById(updateProfesor.persona_id)

    res.status(200).json({
      success: true,
      data: {
        persona: updatePersona,
        Profesor: updateProfesor
      },
      message: "Profesor actualizado exitosamente",
    })
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id)
    const profesor = await ProfesorRepository.delete(id)

    if (!profesor) {
      throw new AppError("Profesor no encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: profesor,
      message: "Profesor eliminado exitosamente",
    })
  }
}
