
import { Persona, type PersonaCreationAttributes, PersonaAttributes } from "../models/sequelize/Persona"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { ValidationError } from "sequelize"
import { AppError } from "../utils/AppError"

export class PersonaService {
  static async validateOrCreatePersona(
    personaData: PersonaCreationAttributes,
    client?: any
  ): Promise<PersonaAttributes> {
    try {
      // Normalizar strings vacíos a null en campos opcionales antes de validar.
      // Sequelize ejecuta los validadores de instancia sobre "" aunque allowNull=true.
      const optionalStringFields = [
        "apellido_paterno", "apellido_materno", "grupo_sanguineo",
        "grupo_etnico", "credo_religioso", "lugar_nacimiento",
        "serial_registro_civil", "expedida_en",
      ] as const
      const data = { ...personaData }
      for (const field of optionalStringFields) {
        if ((data as any)[field] === "") (data as any)[field] = null
      }

      const existingPersona = await PersonaRepository.existingPersonaByDocumento(
        data.numero_documento
      )

      if (existingPersona) {
        return existingPersona
      }

      await Persona.build(data).validate()

      //  Crear persona con datos ya normalizados
      return await PersonaRepository.create(data, client)

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


