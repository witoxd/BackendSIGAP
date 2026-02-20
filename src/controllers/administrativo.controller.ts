import type { NextFunction, Request, Response } from "express"
import { AdministrativoRepository } from "../models/Repository/AdministrativoRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { CreateAdministrativoDTO, UpdateAdministrativoDTO } from "../types"
import { PersonaService } from "../services/persona.service"
import { transaction } from "../config/database"


type CreateAdministrativoStaticRequest = Request<never, unknown, CreateAdministrativoDTO>

type UpdateAdministrativoStaticRequest = Request<{ id: string }, unknown, UpdateAdministrativoDTO>

export class AdministrativoController {

  async getAll(req: Request, res: Response) {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const offset = Number.parseInt(req.query.offset as string) || 0

    const administrativos = await AdministrativoRepository.findAll(limit, offset)
    const total = await AdministrativoRepository.count()

    res.status(200).json({
      success: true,
      data: administrativos,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    })
  }



  async getById(req: Request, res: Response) {

    const id = Number(req.params.id)
    const administrativo = await AdministrativoRepository.findById(id)

    if (!administrativo) {
      throw new AppError("Administrativo no encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: administrativo,
    })
  }

  async SearchIndex(req: Request, res: Response) {
      const limit = Number.parseInt(req.query.limit as string) || 50
      const index = req.params.index as string
  
      if (!index) {
        throw new AppError("Parámetro index requerido", 400)
      }
  
      const administrativo = await AdministrativoRepository.SearchIndex(index, limit)
  
      if (!administrativo || administrativo.length === 0) {
        throw new AppError("Administrativo no encontrado", 404)
      }
  
      res.status(200).json({
        success: true,
        data: administrativo,
        pagination: {
          total: administrativo.length,
          limit,
          pages: Math.ceil(administrativo.length / limit),
        },
      })
    }


  async create(req: CreateAdministrativoStaticRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const { persona: PersonaData, administrativo: AdministrativoData } = req.body

    try {

      const { newPersona, NewAdministrativo } = await transaction(async (client) => {

        const newPersona = await PersonaService.validateOrCreatePersona(PersonaData, client)

        const existingAdministrativo = await AdministrativoRepository.findByPersonaId(newPersona.permiso_id)

        if(existingAdministrativo){
          throw new AppError ("La persona ya tiene rol administrativo", 409)
        }
        const NewAdministrativo = await AdministrativoRepository.create({
          ...AdministrativoData,
          persona_id: newPersona.persona_id
        }, client)

        return { newPersona, NewAdministrativo }
      })

      res.status(201).json({
        success: true,
        data: {
          persona: newPersona,
          administrador: NewAdministrativo
        },
        message: "Administrativo creado exitosamente",
      })
    } catch (error) {
      next(error)
    }
  }


  async update(req: UpdateAdministrativoStaticRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const Administrativoid = Number(req.params.id)

    const existingAdministrativo = await AdministrativoRepository.findById(Administrativoid)
    if (!existingAdministrativo) {
      throw new AppError("Administrador no encontrado", 404)
    }

    const { persona: PersonaData, administrativo: AdministradorData } = req.body


    try {
      const updateAdministrador = await transaction(async (client) => {

        // Si llega persona, actualizar persona
        if (PersonaData) {
          // Validar documento único
          if (PersonaData.numero_documento) {
            const personaConflicto = await PersonaRepository.findByDocumento(PersonaData.numero_documento)

            if (personaConflicto && personaConflicto.persona_id !== existingAdministrativo.persona_id) {
              throw new AppError("Ya existe otra persona con ese documento", 409)
            }
          }

          await PersonaRepository.update(existingAdministrativo.persona_id, PersonaData, client)
        }

        let AdministrativoUpdate = null
        if (AdministradorData && Object.keys(AdministradorData).length > 0) {
          AdministrativoUpdate = await AdministrativoRepository.update(Administrativoid, AdministradorData, client);
        } else {
          AdministrativoUpdate = await AdministrativoRepository.findById(Administrativoid);
        }

        return AdministrativoUpdate

      })


      const updatePersona = await PersonaRepository.findById(existingAdministrativo.persona_id)


      res.status(200).json({
        success: true,
        data: {
          persona: updatePersona,
          admisnitrador: updateAdministrador,
        },
        message: "Administrativo actualizado exitosamente",
      })

    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id)
    const administrativo = await AdministrativoRepository.delete(id)

    if (!administrativo) {
      throw new AppError("Administrativo no encontrado", 404)
    }

    const persona = await PersonaRepository.delete(administrativo.persona_id)

    res.status(200).json({
      success: true,
      data: {
        administrativo: administrativo,
        persona: persona
      },
      message: "Administrativo eliminado exitosamente",
    })
  }
}
