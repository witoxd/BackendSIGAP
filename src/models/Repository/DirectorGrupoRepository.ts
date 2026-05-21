import { query } from "../../config/database"
import { DirectorGrupoCreationAttributes } from "../sequelize/DirectorGrupo"

export class DirectorGrupoRepository {
  static async findByCurso(cursoId: number) {
    const result = await query(
      `SELECT
         dg.director_id,
         dg.curso_id,
         dg.periodo_id,
         dg.profesor_id,
         pm.anio,
         pm.descripcion AS periodo_descripcion,
         pm.activo AS periodo_activo,
         p.nombres,
         p.apellido_paterno,
         p.apellido_materno,
         p.numero_documento
       FROM director_grupo dg
       INNER JOIN profesores pr ON dg.profesor_id = pr.profesor_id
       INNER JOIN personas p    ON pr.persona_id  = p.persona_id
       INNER JOIN periodos_matricula pm ON dg.periodo_id = pm.periodo_id
       WHERE dg.curso_id = $1
       ORDER BY pm.anio DESC`,
      [cursoId]
    )
    return result.rows
  }

  static async findByPeriodo(periodoId: number) {
    const result = await query(
      `SELECT
         dg.director_id,
         dg.curso_id,
         dg.periodo_id,
         dg.profesor_id,
         c.grado,
         c.nivel,
         c.grupo,
         p.nombres,
         p.apellido_paterno,
         p.apellido_materno
       FROM director_grupo dg
       INNER JOIN cursos c       ON dg.curso_id   = c.curso_id
       INNER JOIN profesores pr  ON dg.profesor_id = pr.profesor_id
       INNER JOIN personas p     ON pr.persona_id  = p.persona_id
       WHERE dg.periodo_id = $1
       ORDER BY c.grado, c.grupo`,
      [periodoId]
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      "SELECT * FROM director_grupo WHERE director_id = $1",
      [id]
    )
    return result.rows[0] ?? null
  }

  static async create(data: DirectorGrupoCreationAttributes, client?: any) {
    const result = await query(
      `INSERT INTO director_grupo (curso_id, periodo_id, profesor_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.curso_id, data.periodo_id, data.profesor_id],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<Pick<DirectorGrupoCreationAttributes, "profesor_id">>, client?: any) {
    const result = await query(
      `UPDATE director_grupo SET profesor_id = $1 WHERE director_id = $2 RETURNING *`,
      [data.profesor_id, id],
      client
    )
    return result.rows[0]
  }

  static async findByProfesor(profesorId: number) {
    const result = await query(
      `SELECT
         dg.director_id,
         dg.curso_id,
         dg.periodo_id,
         dg.profesor_id,
         c.grado,
         c.nivel,
         c.grupo,
         pm.anio,
         pm.descripcion AS periodo_descripcion,
         pm.activo      AS periodo_activo
       FROM director_grupo dg
       INNER JOIN cursos c              ON dg.curso_id   = c.curso_id
       INNER JOIN periodos_matricula pm ON dg.periodo_id = pm.periodo_id
       WHERE dg.profesor_id = $1
       ORDER BY pm.anio DESC, c.grado, c.grupo`,
      [profesorId]
    )
    return result.rows
  }

  static async delete(id: number) {
    const result = await query(
      "DELETE FROM director_grupo WHERE director_id = $1 RETURNING *",
      [id]
    )
    return result.rows[0]
  }
}
