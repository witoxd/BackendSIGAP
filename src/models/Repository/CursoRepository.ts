import { query } from "../../config/database"
import { CursoCreationAttributes } from "../sequelize/Curso"

export class CursoRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query("SELECT curso_id, nombre, grado FROM cursos ORDER BY grado DESC, grado ASC LIMIT $1 OFFSET $2", [limit, offset])
    return result.rows
  }

  static async findById(id: number) {
    const result = await query("SELECT curso_id, nombre, grado FROM cursos WHERE curso_id = $1", [id])
    return result.rows[0]
  }


  static async create(data: Omit<CursoCreationAttributes, "curso_id">, client?: any) {
    const rsult = await query(
      `INSERT INTO cursos (nombre, grado)
       VALUES ($1, $2) RETURNING *`,
      [
        data.nombre,
        data.grado
      ],
      client
    )
    return rsult.rows[0]
  }

  static async update(id: number, data: Partial<CursoCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "curso_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE cursos SET ${fields.join(", ")} WHERE curso_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM cursos WHERE curso_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM cursos")
    return parseInt(result.rows[0].count, 10)
  }

}
