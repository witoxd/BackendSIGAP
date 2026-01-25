import { query } from "../../config/database"
import type { JornadaCreationAttributes } from "../sequelize/Jornada"

export class JornadaRepository {
  static async findAll() {
    const result = await query("SELECT * FROM jornadas ORDER BY nombre")
    return result.rows
  }

  static async findById(id: number) {
    const result = await query("SELECT * FROM jornadas WHERE jornada_id = $1", [id])
    return result.rows[0]
  }

  static async create(data: Omit<JornadaCreationAttributes, "jornada_id">, client?: any) {
    const result = await query(
      `INSERT INTO jornadas (nombre, hora_inicio, hora_fin)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.nombre, data.hora_inicio, data.hora_fin],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<JornadaCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "jornada_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE jornadas SET ${fields.join(", ")} WHERE jornada_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM jornadas WHERE jornada_id = $1 RETURNING *", [id])
    return result.rows[0]
  }
}
