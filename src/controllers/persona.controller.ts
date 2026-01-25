// src/services/persona.service.ts
import { PersonaRepository } from "../models/Repository/PersonaRepository";
import { AppError } from "../utils/AppError";
import { Request, Response } from "express";
import { validationResult } from "express-validator"
import { PersonaCreationAttributes } from "../models/sequelize/Persona";
import { CreatePersonaDTO, UpdatePersonaDTO } from "../types";

type CreationPersonaStaticRequest = Request<never, unknown, CreatePersonaDTO>

export class PersonaController {

  async getAll(req: Request, res: Response) {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const offset = Number.parseInt(req.query.offset as string) || 0

    const personas = await PersonaRepository.findAll(limit, offset)
    const total = await PersonaRepository.count()

    res.status(200).json({
      success: true,
      data: personas,
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
    const persona = await PersonaRepository.findById(Number(id))

    if (!persona) {
      throw new AppError("Persona no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: persona,
    })
  }

  async getByDocumento(req: Request, res: Response) {
    const { numero_documento } = req.params
    const persona = await PersonaRepository.findByDocumento(numero_documento as string)

    if (!persona) {
      throw new AppError("Persona no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: persona,
    })
  }

  async searchByDocumento (req: Request, res: Response){
    const {numero_documento} = req.params
  
        const persona = await PersonaRepository.findByDocumento(numero_documento as string)

    if (!persona) {
      throw new AppError("Persona no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: persona,
    })
  }

  async SearchIndex(req: Request, res: Response){
    const  index  = req.params.index as string

      if (!index) {
    throw new AppError("Parámetro index requerido", 400)
  }

    const persona = await PersonaRepository.SearchIndex(index)

    if(!persona){
      throw new AppError("Persona no encontrada", 404)
    }

      res.status(200).json({
      success: true,
      data: persona,
    })
  }

  static async createPersona(data: Omit<PersonaCreationAttributes, "persona_id">) {
    const existingPersona = await PersonaRepository.findByDocumento(data.numero_documento)
    if (existingPersona) {
      throw new AppError("Ya existe una persona con ese número de documento", 409)
    }

    const persona = await PersonaRepository.create(data)
    return persona
  }



  async create(req: CreationPersonaStaticRequest, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const {persona: PersonaData} = req.body

    const existingPersona = await PersonaRepository.findByDocumento(PersonaData.numero_documento)
    if (existingPersona) {
      throw new AppError("Ya existe una persona con ese número de documento", 409)
    }

    const persona = await PersonaRepository.create(PersonaData)

    res.status(201).json({
      success: true,
      data: persona,
      message: "Persona creada exitosamente",
    })
  }

 async update(req: Request<{id: string}, unknown, UpdatePersonaDTO>, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const  id  = Number(req.params.id)

    const {persona: PersonaData} = req.body

    if (PersonaData.numero_documento) {
      const existingPersona = await PersonaRepository.findByDocumento(PersonaData.numero_documento)
      if (existingPersona && existingPersona.persona_id !== id) {
        throw new AppError("Ya existe otra persona con ese número de documento", 409)
      }
    }

    const persona = await PersonaRepository.update(id, PersonaData)

    if (!persona) {
      throw new AppError("Persona no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: persona,
      message: "Persona actualizada exitosamente",
    })
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params
    const persona = await PersonaRepository.delete(Number(id))

    if (!persona) {
      throw new AppError("Persona no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: persona,
      message: "Persona eliminada exitosamente",
    })
  }
}
