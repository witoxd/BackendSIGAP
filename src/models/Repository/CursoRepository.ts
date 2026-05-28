import { query } from "../../config/database"
import { CursoCreationAttributes } from "../sequelize/Curso"

const CURSO_FIELDS = `
  c.curso_id,
  c.grado,
  c.nivel,
  c.grupo,
  c.jornada_id,
  j.nombre AS jornada_nombre,
  c.capacidad_maxima,
  c.activo
`

export class CursoRepository {
  static async findAll(limit = 50, offset = 0, soloActivos = false) {
    const whereClause = soloActivos ? "WHERE c.activo = true" : ""
    const result = await query(
      `SELECT ${CURSO_FIELDS}
       FROM cursos c
       INNER JOIN jornadas j ON c.jornada_id = j.jornada_id
       ${whereClause}
       ORDER BY c.nivel, c.grado, c.grupo
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT ${CURSO_FIELDS}
       FROM cursos c
       INNER JOIN jornadas j ON c.jornada_id = j.jornada_id
       WHERE c.curso_id = $1`,
      [id]
    )
    return result.rows[0] ?? null
  }

  static async findDetalles(id: number) {
    const [cursoResult, directorResult, asignacionesResult] = await Promise.all([
      query(
        `SELECT ${CURSO_FIELDS}
         FROM cursos c
         INNER JOIN jornadas j ON c.jornada_id = j.jornada_id
         WHERE c.curso_id = $1`,
        [id]
      ),
      query(
        `SELECT
           dg.director_id,
           dg.periodo_id,
           pm.anio,
           pm.descripcion AS periodo_descripcion,
           pm.activo AS periodo_activo,
           p.nombres,
           p.apellido_paterno,
           p.apellido_materno,
           pr.profesor_id
         FROM director_grupo dg
         INNER JOIN profesores pr ON dg.profesor_id = pr.profesor_id
         INNER JOIN docente d     ON pr.docente_id  = d.docente_id
         INNER JOIN personas p    ON d.persona_id   = p.persona_id
         INNER JOIN periodos_matricula pm ON dg.periodo_id = pm.periodo_id
         WHERE dg.curso_id = $1
         ORDER BY pm.anio DESC`,
        [id]
      ),
      query(
        `SELECT
           ad.asignacion_id,
           ad.periodo_id,
           ad.materia,
           ad.horas_semanales,
           p.nombres,
           p.apellido_paterno,
           p.apellido_materno,
           pr.profesor_id
         FROM asignacion_docente ad
         INNER JOIN profesores pr ON ad.profesor_id = pr.profesor_id
         INNER JOIN docente d     ON pr.docente_id  = d.docente_id
         INNER JOIN personas p    ON d.persona_id   = p.persona_id
         WHERE ad.curso_id = $1
         ORDER BY ad.periodo_id DESC, ad.materia`,
        [id]
      ),
    ])

    const curso = cursoResult.rows[0]
    if (!curso) return null

    return {
      ...curso,
      directores: directorResult.rows,
      asignaciones: asignacionesResult.rows,
    }
  }

  static async findDetallesPorPeriodo(cursoId: number, periodoId: number) {
    const [periodoResult, directorResult, asignacionesResult, estudiantesResult] = await Promise.all([
      query(
        `SELECT periodo_id, anio, descripcion, activo, fecha_inicio, fecha_fin
         FROM periodos_matricula
         WHERE periodo_id = $1`,
        [periodoId]
      ),
      query(
        `SELECT
           dg.director_id,
           pr.profesor_id,
           p.nombres,
           p.apellido_paterno,
           p.apellido_materno
         FROM director_grupo dg
         INNER JOIN profesores pr ON dg.profesor_id = pr.profesor_id
         INNER JOIN docente d     ON pr.docente_id  = d.docente_id
         INNER JOIN personas p    ON d.persona_id   = p.persona_id
         WHERE dg.curso_id = $1 AND dg.periodo_id = $2
         LIMIT 1`,
        [cursoId, periodoId]
      ),
      query(
        `SELECT
           ad.asignacion_id,
           ad.materia,
           ad.horas_semanales,
           pr.profesor_id,
           p.nombres,
           p.apellido_paterno,
           p.apellido_materno
         FROM asignacion_docente ad
         INNER JOIN profesores pr ON ad.profesor_id = pr.profesor_id
         INNER JOIN docente d     ON pr.docente_id  = d.docente_id
         INNER JOIN personas p    ON d.persona_id   = p.persona_id
         WHERE ad.curso_id = $1 AND ad.periodo_id = $2
         ORDER BY ad.materia`,
        [cursoId, periodoId]
      ),
      query(
        `SELECT
           m.matricula_id,
           m.estado_actual,
           e.estudiante_id,
           p.nombres,
           p.apellido_paterno,
           p.apellido_materno,
           p.numero_documento,
           td.nombre_documento AS tipo_documento
         FROM v_matriculas m
         INNER JOIN estudiantes e  ON m.estudiante_id = e.estudiante_id
         INNER JOIN personas p     ON e.persona_id    = p.persona_id
         LEFT  JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
         WHERE m.curso_id = $1 AND m.periodo_id = $2
         ORDER BY p.apellido_paterno, p.apellido_materno, p.nombres`,
        [cursoId, periodoId]
      ),
    ])

    return {
      periodo:     periodoResult.rows[0]    ?? null,
      director:    directorResult.rows[0]   ?? null,
      asignaciones: asignacionesResult.rows,
      estudiantes:  estudiantesResult.rows,
    }
  }

  static async create(data: Omit<CursoCreationAttributes, "curso_id">, client?: any) {
    const result = await query(
      `INSERT INTO cursos (grado, nivel, grupo, jornada_id, capacidad_maxima, activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.grado,
        data.nivel,
        data.grupo,
        data.jornada_id,
        data.capacidad_maxima ?? 40,
        data.activo ?? true,
      ],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<CursoCreationAttributes>, client?: any) {
    const allowed = ["grado", "nivel", "grupo", "jornada_id", "capacidad_maxima", "activo"]
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
      `UPDATE cursos SET ${fields.join(", ")} WHERE curso_id = $${idx} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query(
      "UPDATE cursos SET activo = false WHERE curso_id = $1 RETURNING *",
      [id]
    )
    return result.rows[0]
  }

  static async count(soloActivos = false) {
    const whereClause = soloActivos ? "WHERE activo = true" : ""
    const result = await query(`SELECT COUNT(*) FROM cursos ${whereClause}`)
    return parseInt(result.rows[0].count, 10)
  }
}
