import { query } from "../../config/database"
import { MatriculaCreationAttributes } from "../sequelize/Matricula"

export class MatriculaRepository {

  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT m.*, 
              e.*,
              p.nombres, p.apellido_paterno,
              c.nombre as curso_nombre
       FROM matriculas m
       INNER JOIN estudiantes e ON m.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       INNER JOIN cursos c ON m.curso_id = c.curso_id
       ORDER BY m.fecha_matricula DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT m.*, 
              e.*,
              p.nombres, p.apellido_paterno, p.apellido_materno,
              c.nombre as curso_nombre, c.grado
       FROM matriculas m
       INNER JOIN estudiantes e ON m.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       INNER JOIN cursos c ON m.curso_id = c.curso_id
       WHERE m.matricula_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByEstudiante(estudianteId: number) {
    const result = await query(
      `SELECT m.*, c.nombre as curso_nombre, c.grado, c.seccion
       FROM matriculas m
       INNER JOIN cursos c ON m.curso_id = c.curso_id
       WHERE m.estudiante_id = $1
       ORDER BY m.anio_escolar DESC, m.fecha_matricula DESC`,
      [estudianteId],
    )
    return result.rows
  }

  static async findByCurso(cursoId: number) {
    const result = await query(
      `SELECT m.*, 
              e.*,
              p.nombres, p.apellido_paterno, p.apellido_materno
       FROM matriculas m
       INNER JOIN estudiantes e ON m.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       WHERE m.curso_id = $1
       ORDER BY p.apellido_paterno, p.nombres`,
      [cursoId],
    )
    return result.rows
  }
  
static async findByEstudianteAndPeriodo(estudianteId: number, periodoId: number) {
  const result = await query(
    "SELECT * FROM matriculas WHERE estudiante_id = $1 AND periodo_id = $2",
    [estudianteId, periodoId]
  )
  return result.rows[0] ?? null
}

  static async create(data: Omit<MatriculaCreationAttributes, "matricula_id">, client?: any) {
    const result = await query(
      `INSERT INTO matriculas (estudiante_id, curso_id, jornada_id, periodo_id, estado)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.estudiante_id, data.curso_id, data.jornada_id, data.periodo_id, data.estado || "activa"],
      client
    )
    return result.rows[0]
  }



  static async update(id: number, Data: Partial<MatriculaCreationAttributes>, client?: any) {
 const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(Data).forEach(([key, value]) => {
      if (key !== "matricula_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE matriculas SET ${fields.join(", ")} WHERE matricula_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM matriculas WHERE matricula_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM matriculas")
    return Number.parseInt(result.rows[0].count)
  }
}
