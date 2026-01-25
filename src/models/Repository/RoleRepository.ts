import { query } from "../../config/database"
import type { Role } from "../sequelize/Role"

export class RoleRepository {
  static async findAll() {
    const result = await query("SELECT * FROM roles ORDER BY role_id")
    return result.rows
  }

  static async findById(id: number) {
    const result = await query("SELECT * FROM roles WHERE role_id = $1", [id])
    return result.rows[0]
  }

  static async findByName(nombre: string) {
    const result = await query("SELECT * FROM roles WHERE nombre = $1", [nombre])
    return result.rows[0]
  }

  static async create(data: Omit<Role, "role_id">) {
    const result = await query("INSERT INTO roles (nombre, descripcion) VALUES ($1, $2) RETURNING *", [
      data.nombre,
      data.descripcion,
    ])
    return result.rows[0]
  }

  static async update(id: number, data: Partial<Role>) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "role_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE roles SET ${fields.join(", ")} WHERE role_id = $${paramCount} RETURNING *`,
      values,
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM roles WHERE role_id = $1 RETURNING *", [id])
    return result.rows[0]
  }
}
