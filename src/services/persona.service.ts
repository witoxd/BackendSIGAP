
import { Persona, type PersonaCreationAttributes } from "../models/sequelize/Persona"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { ValidationError } from "sequelize"
import { AppError } from "../utils/AppError"

export class PersonaService {
  static async validateOrCreatePersona(
    personaData: PersonaCreationAttributes,
    client?: any
  ) {
    try {
      const existingPersona = await PersonaRepository.findByDocumento(
        personaData.numero_documento
      )

      if (existingPersona) {
        return existingPersona
      }

      await Persona.build(personaData).validate()

      //  Crear persona
      return await PersonaRepository.create(personaData, client)

    } catch (error) {
      //  Error de validación de dominio
      if (error instanceof ValidationError) {
        throw new AppError(
          "Persona no encontrada y datos inválidos para creación",
          400,
          error.errors.map(e => ({
            field: e.path,
            message: e.message,
          }))
        )
      }

      throw error
    }
  }
}


