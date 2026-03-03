import { query } from "../../config/database"
import { AdministrativoCreationAttributes } from "../sequelize/Administrativo"


export class AdministrativoRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT
        json_build_object(
        'persona_id', a.persona_id,
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
       json_build_object(
         'administrativo_id', a.administrativo_id,
         'cargo', a.cargo,
         'fecha_contratacion', a.fecha_contratacion,
         'estado', a.estado
       ) AS administrativo
       FROM administrativos a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY a.administrativo_id LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT
        json_build_object(
        'persona_id', a.persona_id,
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
       json_build_object(
         'administrativo_id', a.administrativo_id,
         'cargo', a.cargo,
         'fecha_contratacion', a.fecha_contratacion,
         'estado', a.estado
       ) AS administrativo
       FROM administrativos a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE a.administrativo_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByPersonaId(personaId: number) {
    const result = await query(
      `SELECT
        json_build_object(
        'persona_id', a.persona_id,
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
       json_build_object(
         'administrativo_id', a.administrativo_id,
         'cargo', a.cargo,
         'fecha_contratacion', a.fecha_contratacion,
         'estado', a.estado
       ) AS administrativo
       FROM administrativos a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE a.persona_id = $1`,
      [personaId],
    )
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
        'persona_id', a.persona_id,
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
       json_build_object(
         'administrativo_id', a.administrativo_id,
         'cargo', a.cargo,
         'fecha_contratacion', a.fecha_contratacion,
         'estado', a.estado
       ) AS administrativo
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
       FROM administrativos a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id,
       input
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

  static async create(data: Omit<AdministrativoCreationAttributes, "administrativo_id">, client?: any) {
    const result = await query(
      `INSERT INTO administrativos (persona_id , cargo, fecha_contratacion, estado)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.persona_id, data.cargo, data.fecha_contratacion || new Date(),  data.estado || true],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<AdministrativoCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "administrativo_id" && key !== "fecha_contratacion" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE administrativos SET ${fields.join(", ")} WHERE administrativo_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query(`DELETE FROM administrativos WHERE administrativo_id = $1 RETURNING *`, [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query(`SELECT COUNT(*) FROM administrativos`)
    return Number.parseInt(result.rows[0].count)
  }
}
