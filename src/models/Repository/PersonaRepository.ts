import { query } from "../../config/database"
import type { PersonaCreationAttributes } from "../../models/sequelize/Persona"
import { AppError } from "@/src/utils/AppError"

export class PersonaRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT 
            json_build_object(
        'persona_id', p.persona_id,
        'nombres', p.nombres,
        'apellido_paterno', p.apellido_paterno,
        'apellido_materno', p.apellido_materno,
        'tipo_sangre', p.tipo_sangre,
        'fecha_nacimiento', p.fecha_nacimiento,
        'genero', p.genero,
        'numero_documento', p.numero_documento,
        'tipo_documento', json_build_object(
          'tipo_documento_id', td.tipo_documento_id,
          'tipo_documento', td.tipo_documento
        )
      ) AS persona
      FROM personas p INNER JOIN tipo_documento td
     ON p.tipo_documento_id = td.tipo_documento_id
      ORDER BY persona_id LIMIT $1 OFFSET $2`, [limit, offset])
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT 
            json_build_object(
        'persona_id', p.persona_id,
        'nombres', p.nombres,
        'apellido_paterno', p.apellido_paterno,
        'apellido_materno', p.apellido_materno,
        'tipo_sangre', p.tipo_sangre,
        'fecha_nacimiento', p.fecha_nacimiento,
        'genero', p.genero,
        'numero_documento', p.numero_documento,
        'tipo_documento', json_build_object(
          'tipo_documento_id', td.tipo_documento_id,
          'tipo_documento', td.tipo_documento
        )
      ) AS persona
      FROM personas p INNER JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id WHERE persona_id = $1`, [id])
    return result.rows[0]
  }

  static async findByDocumento(numero_documento: string) {
    const result = await query(
      `SELECT 
            json_build_object(
        'persona_id', p.persona_id,
        'nombres', p.nombres,
        'apellido_paterno', p.apellido_paterno,
        'apellido_materno', p.apellido_materno,
        'tipo_sangre', p.tipo_sangre,
        'fecha_nacimiento', p.fecha_nacimiento,
        'genero', p.genero,
        'numero_documento', p.numero_documento,
        'tipo_documento', json_build_object(
          'tipo_documento_id', td.tipo_documento_id,
          'tipo_documento', td.tipo_documento
        )
      ) AS persona
      FROM personas p INNER JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id WHERE numero_documento = $1`, [numero_documento])
    return result.rows[0]
  }

  static async searchByDocumento(numero_documento: string) {
    const result = await query(
      `SELECT 
            json_build_object(
        'persona_id', p.persona_id,
        'nombres', p.nombres,
        'apellido_paterno', p.apellido_paterno,
        'apellido_materno', p.apellido_materno,
        'tipo_sangre', p.tipo_sangre,
        'fecha_nacimiento', p.fecha_nacimiento,
        'genero', p.genero,
        'numero_documento', p.numero_documento,
        'tipo_documento', json_build_object(
          'tipo_documento_id', td.tipo_documento_id,
          'tipo_documento', td.tipo_documento
        )
      ) AS persona
      FROM personas WHERE numero_documento ILIKE '%' || $1 || '%'`, [numero_documento])
    return result.rows[0]
  }

  static async SearchIndex(index: string, limit = 50) {
    const normalizedIndex = index.trim().replace(/\s+/g, " ")
    if (!normalizedIndex) return []

    const isDocumento = /^\d+$/.test(normalizedIndex)

    const result = await query(
      `WITH input AS (
         SELECT $1::text AS q, $2::boolean AS is_documento
       )
       SELECT
               json_build_object(
        'persona_id', p.persona_id,
        'nombres', p.nombres,
        'apellido_paterno', p.apellido_paterno,
        'apellido_materno', p.apellido_materno,
        'tipo_sangre', p.tipo_sangre,
        'fecha_nacimiento', p.fecha_nacimiento,
        'genero', p.genero,
        'numero_documento', p.numero_documento,
        'tipo_documento', json_build_object(
          'tipo_documento_id', td.tipo_documento_id,
          'tipo_documento', td.tipo_documento
        )
      ) AS persona,
         CASE
           WHEN input.is_documento THEN
             CASE WHEN p.numero_documento = input.q THEN 1 ELSE 0 END
           ELSE
             ts_rank_cd(
               to_tsvector('spanish',
                 coalesce(p.nombres, '') || ' ' ||
                 coalesce(p.apellido_paterno, '') || ' ' ||
                 coalesce(p.apellido_materno, '')
               ),
               plainto_tsquery('spanish', input.q)
             )
         END AS rank
       FROM personas p INNER JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id, input
       WHERE (
         input.is_documento = true
         AND p.numero_documento ILIKE '%' || input.q || '%'
       ) OR (
         input.is_documento = false
         AND (
           to_tsvector('spanish',
             coalesce(p.nombres, '') || ' ' ||
             coalesce(p.apellido_paterno, '') || ' ' ||
             coalesce(p.apellido_materno, '')
           ) @@ plainto_tsquery('spanish', input.q)
           OR (
             char_length(input.q) < 4 AND (
               p.nombres ILIKE '%' || input.q || '%'
               OR p.apellido_paterno ILIKE '%' || input.q || '%'
               OR p.apellido_materno ILIKE '%' || input.q || '%'
             )
           )
         )
       )
       ORDER BY rank DESC, p.apellido_paterno, p.apellido_materno, p.nombres
       LIMIT $3`,
      [normalizedIndex, isDocumento, limit],
    )
    return result.rows
  }

  static async create(data: Omit<PersonaCreationAttributes, "persona_id">, client?: any) {
    const result = await query(
      `INSERT INTO personas (
      nombres,
      apellido_paterno,
      apellido_materno,
      tipo_documento_id,
      numero_documento,
      grupo_sanguineo,
      fecha_nacimiento,
      genero,
      grupo_etnico,
      credo_religioso,
      lugar_nacimiento,
      serial_registro_civil,
      expedida_en
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        data.nombres,
        data.apellido_paterno,
        data.apellido_materno,
        data.tipo_documento_id,
        data.numero_documento,
        data.grupo_sanguineo,
        data.fecha_nacimiento,
        data.genero,
        data.grupo_etnico,
        data.credo_religioso,
        data.lugar_nacimiento,
        data.serial_registro_civil,
        data.expedida_en
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

