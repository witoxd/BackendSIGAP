import { query } from "../../config/database"
import { AsignacionDocenteCreationAttributes } from "../sequelize/AsignacionDocente"

export class AsignacionDocenteRepository {
  static async findByCurso(cursoId: number, periodoId?: number) {
    const whereExtra = periodoId ? "AND ad.periodo_id = $2" : ""
    const params: unknown[] = periodoId ? [cursoId, periodoId] : [cursoId]

    const result = await query(
      `SELECT
         ad.asignacion_id,
         ad.curso_id,
         ad.profesor_id,
         ad.periodo_id,
         ad.materia,
         ad.horas_semanales,
         pm.anio,
         pm.descripcion AS periodo_descripcion,
         p.nombres,
         p.apellido_paterno,
         p.apellido_materno
       FROM asignacion_docente ad
       INNER JOIN profesores pr ON ad.profesor_id = pr.profesor_id
       INNER JOIN personas p    ON pr.persona_id  = p.persona_id
       INNER JOIN periodos_matricula pm ON ad.periodo_id = pm.periodo_id
       WHERE ad.curso_id = $1 ${whereExtra}
       ORDER BY ad.materia`,
      params
    )
    return result.rows
  }

  static async findByProfesor(profesorId: number, periodoId?: number) {
    const whereExtra = periodoId ? "AND ad.periodo_id = $2" : ""
    const params: unknown[] = periodoId ? [profesorId, periodoId] : [profesorId]

    const result = await query(
      `SELECT
         ad.asignacion_id,
         ad.curso_id,
         ad.profesor_id,
         ad.periodo_id,
         ad.materia,
         ad.horas_semanales,
         c.grado,
         c.nivel,
         c.grupo,
         pm.anio,
         pm.descripcion AS periodo_descripcion
       FROM asignacion_docente ad
       INNER JOIN cursos c ON ad.curso_id = c.curso_id
       INNER JOIN periodos_matricula pm ON ad.periodo_id = pm.periodo_id
       WHERE ad.profesor_id = $1 ${whereExtra}
       ORDER BY pm.anio DESC, c.grado, ad.materia`,
      params
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      "SELECT * FROM asignacion_docente WHERE asignacion_id = $1",
      [id]
    )
    return result.rows[0] ?? null
  }

  static async create(data: AsignacionDocenteCreationAttributes, client?: any) {
    const result = await query(
      `INSERT INTO asignacion_docente (curso_id, profesor_id, periodo_id, materia, horas_semanales)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.curso_id, data.profesor_id, data.periodo_id, data.materia, data.horas_semanales ?? null],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<Pick<AsignacionDocenteCreationAttributes, "horas_semanales" | "materia">>, client?: any) {
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (data.materia !== undefined) { fields.push(`materia = $${idx}`); values.push(data.materia); idx++ }
    if (data.horas_semanales !== undefined) { fields.push(`horas_semanales = $${idx}`); values.push(data.horas_semanales); idx++ }

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE asignacion_docente SET ${fields.join(", ")} WHERE asignacion_id = $${idx} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query(
      "DELETE FROM asignacion_docente WHERE asignacion_id = $1 RETURNING *",
      [id]
    )
    return result.rows[0]
  }
}
