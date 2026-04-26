import type { Request, Response, NextFunction } from "express"
import { AcudienteRepository } from "../models/Repository/AcudienteRepository"
import { CreateAcudianteDTO } from "../types"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"
import { transaction } from "../config/database"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { validationResult } from "express-validator"
import { assignToEstudiante } from "../types"
import { PersonaService } from "../services/persona.service"
import { asyncHandler } from "../utils/asyncHandler"



export class AcudienteController {

  getAll = asyncHandler(async (req: Request, res: Response) => {
    
      const { page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      const acudientes = await AcudienteRepository.findAll(pLimit, offset)

      res.status(200).json({
        success: true,
        data: acudientes,
      })
  })

  getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const id = Number(req.params.id)
    const acudiente = await AcudienteRepository.findById(id)

    if (!acudiente) {
      throw new AppError("Acudiente no encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data:
        acudiente
    })
  })

  getAcudientesByEstudiante = asyncHandler(async (req: Request, res: Response) => {

    const estudianteId = Number(req.params.id)
    const acudientes = await AcudienteRepository.getAcudientesByEstudiante(estudianteId)

    res.status(200).json({
      success: true,
      data: acudientes,
    })
  })

   SearchIndex = asyncHandler( async  (req: Request, res: Response) => {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const index = req.params.index as string

    if (!index) {
      throw new AppError("Parámetro index requerido", 400)
    }

    const acudiente = await AcudienteRepository.SearchIndex(index, limit)

    if (!acudiente || acudiente.length === 0) {
      throw new AppError("Acudiente no encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: acudiente,
      pagination: {
        total: acudiente.length,
        limit,
        pages: Math.ceil(acudiente.length / limit),
      },
    })
  })

   create = asyncHandler( async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }
    const { acudiente: AcudienteData, persona: PersonaData } = req.body as CreateAcudianteDTO
      const { NewAcudiente, NewPersona } = await transaction(async (client) => {

        const NewPersona = await PersonaService.validateOrCreatePersona(PersonaData, client)

        const existingAcudiente = await AcudienteRepository.findByPersonaId(NewPersona.persona_id)

        if (existingAcudiente) {
          throw new AppError("La persona ya tiene rol de acudiente", 409)
        }
        console.log(AcudienteData)
        const NewAcudiente = await AcudienteRepository.create({ ...AcudienteData, persona_id: NewPersona.persona_id }, client)

        return { NewAcudiente, NewPersona }

      })


      res.status(201).json({
        success: true,
        message: "Acudiente creado exitosamente",
        data: {
          acudiente: NewAcudiente,
          persona: NewPersona
        },
      })
  })


   update = asyncHandler( async (req: Request, res: Response, next: NextFunction)  => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }
      const AcudienteId = Number(req.params.id)
      const { acudiente: AcudienteData, persona: PersonaData } = req.body
      const existingAcudiente = await AcudienteRepository.findById(AcudienteId)

      if (!existingAcudiente) {
        throw new AppError("No existe un acudiente a actualizar", 404)
      }

      const AcudienteUpdate = await transaction(async (client) => {
        if (PersonaData) {
          // Validar documento único
          if (PersonaData.numero_documento) {
            const personaConflicto = await PersonaRepository.findByDocumento(PersonaData.numero_documento)
            if (personaConflicto && personaConflicto.persona_id !== existingAcudiente.persona_id) {
              throw new AppError("Ya existe otra persona con ese documento", 409)
            }
          }
          await PersonaRepository.update(existingAcudiente.persona_id, PersonaData, client)
        }

        let AcudienteUpdate = null
        if (AcudienteData && Object.keys(AcudienteData).length > 0) {
          AcudienteUpdate = await AcudienteRepository.update(AcudienteId, AcudienteData);
        } else {
          AcudienteUpdate = await AcudienteRepository.findById(AcudienteId);
        }

        return AcudienteUpdate
      })

      const updatePersona = await PersonaRepository.findById(existingAcudiente.persona_id)

      res.status(200).json({
        success: true,
        message: "Acudiente actualizado exitosamente",
        data: {
          acudiente: AcudienteUpdate,
          persona: updatePersona
        },
      })
  })

   delete = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {

      const id = Number(req.params.id)
      const acudiente = await AcudienteRepository.delete(id)

      if (!acudiente) {
        throw new AppError("Acudiente no encontrado", 404)
      }

      await PersonaRepository.delete(acudiente.persona_id)

      res.status(200).json({
        success: true,
        message: "Acudiente eliminado exitosamente",
      })
  })

   assignToEstudiante = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { assignToEstudiante: AcudienteAssingEstudiante } = req.body as assignToEstudiante
      const result = await AcudienteRepository.assignToEstudiante(AcudienteAssingEstudiante)

      res.status(200).json({
        success: true,
        message: "Acudiente asignado al estudiante exitosamente",
        data: result,
      })
  })

   removeFromEstudiante = asyncHandler(async (req: Request, res: Response, next: NextFunction) =>{
      const estudianteId = Number(req.params.estudianteId)
      const acudienteId = Number(req.params.acudienteId)
      const result = await AcudienteRepository.removeFromEstudiante(
        estudianteId,
        acudienteId,
      )

      if (!result) {
        throw new AppError("Relación no encontrada", 404)
      }

      res.status(200).json({
        success: true,
        message: "Acudiente removido del estudiante exitosamente",
      })
  })

   getEstudiantesByAcudiente = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

      const estudianteId = Number(req.params.id)
      const estudiantes = await AcudienteRepository.getAcudientesByEstudiante(estudianteId)

      res.status(200).json({
        success: true,
        data: estudiantes,
      })
  })
}
