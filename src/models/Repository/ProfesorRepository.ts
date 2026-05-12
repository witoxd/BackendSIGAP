import { query } from "../../config/database"
import { ProfesorCreationAttributes } from "../sequelize/Profesor"
import { PERSONA_FIELDS_JSON } from "../shared/personasql"

// Campos del docente (contratación compartida) + campos específicos del profesor
const DOCENTE_FIELDS_JSON = `
  json_build_object(
    'docente_id',         d.docente_id,
    'cargo',              d.cargo,
    'sede',               d.sede,
    'jornada_id',         d.jornada_id,
    'jornada_nombre',     j.nombre,
    'tipo_contrato',      d.tipo_contrato,
    'estado',             d.estado,
    'fecha_contratacion', d.fecha_contratacion
  ) AS docente
`

const PROFESOR_FIELDS_JSON = `
  json_build_object(
    'profesor_id',        pr.profesor_id,
    'docente_id',         pr.docente_id,
    'fecha_nombramiento', pr.fecha_nombramiento,
    'numero_resolucion',  pr.numero_resolucion,
    'titulo',             pr.titulo,
    'perfil_profesional', pr.perfil_profesional,
    'posgrado',           pr.posgrado,
    'grado_escalafon',    pr.grado_escalafon,
    'area',               pr.area
  ) AS profesor
`

const JOINS = `
  FROM profesores pr
  INNER JOIN docente d    ON pr.docente_id        = d.docente_id
  INNER JOIN personas p   ON d.persona_id         = p.persona_id
  LEFT  JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
  LEFT  JOIN jornadas j   ON d.jornada_id         = j.jornada_id
`

export class ProfesorRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT
       ${PERSONA_FIELDS_JSON},
       ${DOCENTE_FIELDS_JSON},
       ${PROFESOR_FIELDS_JSON}
       ${JOINS}
       ORDER BY pr.profesor_id
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
       ${PROFESOR_FIELDS_JSON}
       ${JOINS}
       WHERE pr.profesor_id = $1`,
      [id]
    )
    return result.rows[0] ?? null
  }

  static async findByPersonaId(personaId: number) {
    const result = await query(
      `SELECT
       ${PERSONA_FIELDS_JSON},
       ${DOCENTE_FIELDS_JSON},
       ${PROFESOR_FIELDS_JSON}
       ${JOINS}
       WHERE d.persona_id = $1`,
      [personaId]
    )
    return result.rows[0] ?? null
  }

  static async create(data: Omit<ProfesorCreationAttributes, "profesor_id">, client?: any) {
    const result = await query(
      `INSERT INTO profesores (docente_id, fecha_nombramiento, numero_resolucion, titulo, perfil_profesional, posgrado, grado_escalafon, area)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.docente_id,
        data.fecha_nombramiento ?? null,
        data.numero_resolucion ?? null,
        data.titulo ?? null,
        data.perfil_profesional ?? null,
        data.posgrado ?? null,
        data.grado_escalafon ?? null,
        data.area ?? null,
      ],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<ProfesorCreationAttributes>, client?: any) {
    const allowed = ["fecha_nombramiento", "numero_resolucion", "titulo", "perfil_profesional", "posgrado", "grado_escalafon", "area"]
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    for (const key of allowed) {
      if (key in data && (data as Record<string, unknown>)[key] !== undefined) {
        fields.push(`${key} = $${idx}`)
        values.push((data as Record<string, unknown>)[key])
        idx++
      }
    }

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE profesores SET ${fields.join(", ")} WHERE profesor_id = $${idx} RETURNING *`,
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
       ${DOCENTE_FIELDS_JSON},
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

  static async delete(id: number) {
    const result = await query("DELETE FROM profesores WHERE profesor_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM profesores")
    return Number.parseInt(result.rows[0].count)
  }

  static async findDetalles(profesorId: number) {
    const [baseResult, emergenciaResult] = await Promise.all([
      query(
        `SELECT
          ${PERSONA_FIELDS_JSON},
          json_build_object(
            'docente_id',         d.docente_id,
            'cargo',              d.cargo,
            'sede',               d.sede,
            'jornada_id',         d.jornada_id,
            'jornada_nombre',     j.nombre,
            'tipo_contrato',      d.tipo_contrato,
            'estado',             d.estado,
            'fecha_contratacion', d.fecha_contratacion
          ) AS docente,
          json_build_object(
            'profesor_id',        pr.profesor_id,
            'docente_id',         pr.docente_id,
            'fecha_nombramiento', pr.fecha_nombramiento,
            'numero_resolucion',  pr.numero_resolucion,
            'titulo',             pr.titulo,
            'perfil_profesional', pr.perfil_profesional,
            'posgrado',           pr.posgrado,
            'grado_escalafon',    pr.grado_escalafon,
            'area',               pr.area
          ) AS profesor
         ${JOINS}
         WHERE pr.profesor_id = $1`,
        [profesorId]
      ),
      query(
        `SELECT contacto_emergencia_id, nombre, parentesco, telefono, celular
         FROM profesor_contactos_emergencia
         WHERE profesor_id = $1 AND activo = true
         ORDER BY contacto_emergencia_id`,
        [profesorId]
      ),
    ])

    const base = baseResult.rows[0]
    if (!base) return null

    return {
      ...base,
      contactos_emergencia: emergenciaResult.rows,
    }
  }
}
