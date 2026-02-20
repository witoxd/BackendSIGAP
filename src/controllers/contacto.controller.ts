import type { Request, Response, NextFunction } from "express"
import { ContactoRepository } from "../models/Repository/ContactoRepository"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { AppError } from "../utils/AppError"
import { getPagination } from "../utils/validators"
import { validationResult } from "express-validator"
import type { CreateContactoDTO, UpdateContactoDTO } from "../types"

type CreateContactoStaticRequest = Request<never, unknown, CreateContactoDTO>
type UpdateContactoStaticRequest = Request<{ id: string }, unknown, UpdateContactoDTO>

export class ContactoController {
  /**
   * Obtener todos los contactos
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query
      const { limit: pLimit, offset } = getPagination(page as string, limit as string)

      const contactos = await ContactoRepository.findAll(pLimit, offset)
      const total = await ContactoRepository.count()

      res.status(200).json({
        success: true,
        data: contactos,
        pagination: {
          page: Math.floor(offset / pLimit) + 1,
          limit: pLimit,
          total,
          pages: Math.ceil(total / pLimit),
        },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Obtener contacto por ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const contacto = await ContactoRepository.findById(id)

      if (!contacto) {
        throw new AppError("Contacto no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: contacto,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Obtener contactos por persona
   */
  async getByPersonaId(req: Request, res: Response, next: NextFunction) {
    try {
      const personaId = Number(req.params.personaId)
      const contactos = await ContactoRepository.findByPersonaId(personaId)

      res.status(200).json({
        success: true,
        data: contactos,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Obtener contactos por tipo
   */
  async getByTipo(req: Request, res: Response, next: NextFunction) {
    try {
      const personaId = Number(req.params.personaId)
      const { tipo } = req.query

      if (!tipo) {
        throw new AppError("El tipo de contacto es requerido", 400)
      }

      const contactos = await ContactoRepository.findByTipo(personaId, tipo as string)

      res.status(200).json({
        success: true,
        data: contactos,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Crear un nuevo contacto
   */
  async create(req: CreateContactoStaticRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const { contacto: ContactoData } = req.body

      // Verificar que la persona existe
      const existingPersona = await PersonaRepository.findById(ContactoData.persona_id)
      if (!existingPersona) {
        throw new AppError("Persona no encontrada", 404)
      }

      // Si se marca como principal, quitar principal de otros contactos
      if (ContactoData.es_principal) {
        const contacto = await ContactoRepository.create(ContactoData)
        await ContactoRepository.setPrincipal(contacto.contacto_id, ContactoData.persona_id)

        res.status(201).json({
          success: true,
          message: "Contacto creado exitosamente",
          data: contacto,
        })
      } else {
        const contacto = await ContactoRepository.create(ContactoData)

        res.status(201).json({
          success: true,
          message: "Contacto creado exitosamente",
          data: contacto,
        })
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Crear múltiples contactos
   */
  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const { contactos } = req.body

      if (!Array.isArray(contactos) || contactos.length === 0) {
        throw new AppError("Se requiere un array de contactos", 400)
      }

      // Verificar que todas las personas existen
      const personaIds = [...new Set(contactos.map((c: any) => c.persona_id))]
      for (const personaId of personaIds) {
        const persona = await PersonaRepository.findById(personaId)
        if (!persona) {
          throw new AppError(`Persona con ID ${personaId} no encontrada`, 404)
        }
      }

      const nuevosContactos = await ContactoRepository.bulkCreate(contactos)

      res.status(201).json({
        success: true,
        message: "Contactos creados exitosamente",
        total: nuevosContactos.length,
        data: nuevosContactos,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Actualizar un contacto
   */
  async update(req: UpdateContactoStaticRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const id = Number(req.params.id)
      const { contacto: ContactoData } = req.body

      const existingContacto = await ContactoRepository.findById(id)
      if (!existingContacto) {
        throw new AppError("Contacto no encontrado", 404)
      }

      // Si se marca como principal, actualizar otros contactos
      if (ContactoData.es_principal) {
        await ContactoRepository.setPrincipal(id, existingContacto.persona_id)
      }

      const contacto = await ContactoRepository.update(id, ContactoData)

      if (!contacto) {
        throw new AppError("Contacto no encontrado o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Contacto actualizado exitosamente",
        data: contacto,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Eliminar un contacto (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const contacto = await ContactoRepository.delete(id)

      if (!contacto) {
        throw new AppError("Contacto no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        message: "Contacto eliminado exitosamente",
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Establecer contacto como principal
   */
  async setPrincipal(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)

      const existingContacto = await ContactoRepository.findById(id)
      if (!existingContacto) {
        throw new AppError("Contacto no encontrado", 404)
      }

      const contacto = await ContactoRepository.setPrincipal(id, existingContacto.persona_id)

      res.status(200).json({
        success: true,
        message: "Contacto establecido como principal",
        data: contacto,
      })
    } catch (error) {
      next(error)
    }
  }
}
