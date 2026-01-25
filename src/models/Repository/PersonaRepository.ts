import { query } from "../../config/database"
import type { PersonaCreationAttributes } from "../../models/sequelize/Persona"
import { AppError } from "@/src/utils/AppError"

export class PersonaRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query("SELECT * FROM personas ORDER BY persona_id LIMIT $1 OFFSET $2", [limit, offset])
    return result.rows
  }

  static async findById(id: number) {
    const result = await query("SELECT * FROM personas WHERE persona_id = $1", [id])
    return result.rows[0]
  }

  static async findByDocumento(numero_documento: string) {
    const result = await query("SELECT * FROM personas WHERE numero_documento = $1", [numero_documento])
    return result.rows[0]
  }

  static async searchByDocumento(numero_documento: string) {
    const result = await query("SELECT * FROM personas WHERE numero_documento ILIKE '%' || $1 || '%'", [numero_documento])
    return result.rows[0]
  }

  static async SearchIndex(index: string) {

    const isDocumento = /^\d+$/.test(index)

    console.log("Es documento?: ", isDocumento)

    const result = await query(`SELECT * FROM personas WHERE
       ( $2 = false AND to_tsvector
         (  'spanish', coalesce(nombres, '') || '
            ' || coalesce(apellido_paterno, '') || ' 
            ' || coalesce(apellido_materno, '') )
             @@ plainto_tsquery('spanish', $1))
              OR ($2 = true AND numero_documento ILIKE '%' || $1 || '%' )`, [index, isDocumento])
    return result.rows
  }

  static async create(data: Omit<PersonaCreationAttributes, "persona_id">, client?: any) {
    const result = await query(
      `INSERT INTO personas (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento, fecha_nacimiento, genero)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        data.nombres,
        data.apellido_paterno,
        data.apellido_materno,
        data.tipo_documento_id,
        data.numero_documento,
        data.fecha_nacimiento,
        data.genero,
      ],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<PersonaCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "persona_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE personas SET ${fields.join(", ")} WHERE persona_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM personas WHERE persona_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM personas")
    return Number.parseInt(result.rows[0].count)
  }

  
  static async getOrCreatePersona(personaData: PersonaCreationAttributes, client?: any) {
    const persona = await PersonaRepository.findByDocumento(
      personaData.numero_documento
    )

    if (persona) return persona


    return await PersonaRepository.create(personaData, client)
  }


}


