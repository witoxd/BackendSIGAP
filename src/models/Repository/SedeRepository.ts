import { query } from "../../config/database"
import type { SedeCreationAttributes } from "../sequelize/Sede"


export class SedeRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(`SELECT * FROM sedes ORDER BY nombre LIMIT $1 OFFSET $2`, [limit, offset])
    return result.rows
  }

  static async findById(id: number) {
    const result = await query("SELECT * FROM sedes WHERE sede_id = $1", [id])
    return result.rows[0]
  }

  static async findByNombre(nombre: string) {
    const result = await query("SELECT * FROM sedes WHERE nombre ILIKE $1", [`%${nombre}%`])
    return result.rows
  }

  static async create(data: Omit<SedeCreationAttributes, "sede_id">, client?: any) {
    const result = await query(
      `INSERT INTO sedes (nombre, direccion)
       VALUES ($1, $2) RETURNING *`,
      [data.nombre, data.direccion],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<SedeCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "sede_id" && key !== "created_at" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE sedes SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE sede_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM sedes WHERE sede_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM sedes")
    return Number.parseInt(result.rows[0].count)
  }
}
