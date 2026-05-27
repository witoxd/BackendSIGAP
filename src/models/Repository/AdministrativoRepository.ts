import { query } from "../../config/database"
import { AdministrativoCreationAttributes } from "../sequelize/Administrativo"
import { PERSONA_FIELDS_JSON } from "../shared/personasql"

const DOCENTE_FIELDS_JSON = `
  json_build_object(
    'docente_id',         d.docente_id,
    'sede',               d.sede,
    'jornada_id',         d.jornada_id,
    'jornada_nombre',     j.nombre,
    'tipo_contrato',      d.tipo_contrato,
    'estado',             d.estado,
    'fecha_contratacion', d.fecha_contratacion
  ) AS docente
`

const ADMINISTRATIVO_FIELDS_JSON = `
  json_build_object(
    'administrativo_id', a.administrativo_id,
    'docente_id',        a.docente_id,
    'cargo',             a.cargo
  ) AS administrativo
`

const JOINS = `
  FROM administrativos a
  INNER JOIN docente d         ON a.docente_id          = d.docente_id
  INNER JOIN personas p        ON d.persona_id           = p.persona_id
  LEFT  JOIN tipo_documento td ON p.tipo_documento_id    = td.tipo_documento_id
  LEFT  JOIN jornadas j        ON d.jornada_id           = j.jornada_id
  LEFT  JOIN decretos dec      ON d.decreto_id           = dec.decreto_id
  LEFT  JOIN grados_escalafon ge ON d.grado_escalafon_id = ge.grado_id
`

export class AdministrativoRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT
       ${PERSONA_FIELDS_JSON},
       ${DOCENTE_FIELDS_JSON},
       ${ADMINISTRATIVO_FIELDS_JSON}
       ${JOINS}
       ORDER BY a.administrativo_id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT
       ${PERSONA_FIELDS_JSON},
       ${DOCENTE_FIELDS_JSON},
       ${ADMINISTRATIVO_FIELDS_JSON}
       ${JOINS}
       WHERE a.administrativo_id = $1`,
      [id]
    )
    return result.rows[0] ?? null
  }

  static async findByPersonaId(personaId: number) {
    const result = await query(
      `SELECT
       ${PERSONA_FIELDS_JSON},
       ${DOCENTE_FIELDS_JSON},
       ${ADMINISTRATIVO_FIELDS_JSON}
       ${JOINS}
       WHERE d.persona_id = $1`,
      [personaId]
    )
    return result.rows[0] ?? null
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
       ${DOCENTE_FIELDS_JSON},
       ${ADMINISTRATIVO_FIELDS_JSON},
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
       ${JOINS},
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
      [normalizedIndex, isDocumento, limit]
    )
    return result.rows
  }

  static async create(data: Omit<AdministrativoCreationAttributes, "administrativo_id">, client?: any) {
    const result = await query(
      `INSERT INTO administrativos (docente_id, cargo) VALUES ($1, $2) RETURNING *`,
      [data.docente_id, data.cargo ?? null],
      client
    )
    return result.rows[0]
  }

  static async update(administrativoId: number, data: Pick<AdministrativoCreationAttributes, "cargo">, client?: any) {
    if (data.cargo === undefined) return null
    const result = await query(
      `UPDATE administrativos SET cargo = $1 WHERE administrativo_id = $2 RETURNING *`,
      [data.cargo, administrativoId],
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query(
      `DELETE FROM administrativos WHERE administrativo_id = $1 RETURNING *`,
      [id]
    )
    return result.rows[0]
  }

  static async count() {
    const result = await query(`SELECT COUNT(*) FROM administrativos`)
    return Number.parseInt(result.rows[0].count)
  }
}
