import { query } from "../../config/database"
import { ProfesorCreationAttributes } from "../sequelize/Profesor"
import { PERSONA_FIELDS_JSON } from "../shared/personasql"

const PROFESOR_FIELDS_JSON = `
        json_build_object(
          'profesor_id', pr.profesor_id,
          'fecha_contratacion', pr.fecha_contratacion,
          'estado', pr.estado
        ) AS profesor
`
export class ProfesorRepository  {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT
      ${PERSONA_FIELDS_JSON},
      ${PROFESOR_FIELDS_JSON}
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY pr.profesor_id LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT
       ${PERSONA_FIELDS_JSON},
       ${PROFESOR_FIELDS_JSON}
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE pr.profesor_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByPersonaId(personaId: number) {
    const result = await query(
      `SELECT
       ${PERSONA_FIELDS_JSON},
       ${PROFESOR_FIELDS_JSON}
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE pr.persona_id = $1`,
      [personaId])
    return result.rows[0]
  }

  

  static async create(data: Omit<ProfesorCreationAttributes, "profesor_id">, client?: any) {
    const result = await query(
      `INSERT INTO profesores (persona_id, fecha_contratacion, estado)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.persona_id,  data.fecha_contratacion || new Date(), data.estado || "activo"],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<ProfesorCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "profesor_id" && key !== "fecha_contratacion" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE profesores SET ${fields.join(", ")} WHERE profesor_id = $${paramCount} RETURNING *`,
      values,
      client
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
      ${PERSONA_FIELDS_JSON},
      ${PROFESOR_FIELDS_JSON},
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
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
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

  static async delete(id: number) {
    const result = await query("DELETE FROM profesores WHERE profesor_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM profesores")
    return Number.parseInt(result.rows[0].count)
  }
}
