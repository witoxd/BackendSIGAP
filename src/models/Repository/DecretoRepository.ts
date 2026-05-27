import { query } from "../../config/database"
import type { DecretoCreationAttributes } from "../sequelize/Decreto"

export class DecretoRepository {
  static async findAll() {
    const result = await query("SELECT * FROM decretos ORDER BY codigo")
    return result.rows
  }

  static async findById(id: number) {
    const result = await query("SELECT * FROM decretos WHERE decreto_id = $1", [id])
    return result.rows[0] ?? null
  }

  static async create(data: Omit<DecretoCreationAttributes, "decreto_id">, client?: any) {
    const result = await query(
      `INSERT INTO decretos (codigo, nombre, descripcion)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.codigo, data.nombre, data.descripcion ?? null],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<DecretoCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (data.codigo    !== undefined) { fields.push(`codigo = $${i++}`);     values.push(data.codigo) }
    if (data.nombre    !== undefined) { fields.push(`nombre = $${i++}`);     values.push(data.nombre) }
    if (data.descripcion !== undefined) { fields.push(`descripcion = $${i++}`); values.push(data.descripcion) }

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE decretos SET ${fields.join(", ")} WHERE decreto_id = $${i} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM decretos WHERE decreto_id = $1 RETURNING *", [id])
    return result.rows[0]
  }
}
