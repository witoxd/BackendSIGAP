import { query } from "../../config/database"
import type { GradoEscalafonCreationAttributes } from "../sequelize/GradoEscalafon"

export class GradoEscalafonRepository {
  static async findAll() {
    const result = await query(
      `SELECT g.*, d.codigo AS decreto_codigo, d.nombre AS decreto_nombre
       FROM grados_escalafon g
       JOIN decretos d ON g.decreto_id = d.decreto_id
       ORDER BY g.decreto_id, g.orden, g.codigo`
    )
    return result.rows
  }

  static async findByDecretoId(decretoId: number) {
    const result = await query(
      `SELECT * FROM grados_escalafon
       WHERE decreto_id = $1
       ORDER BY orden, codigo`,
      [decretoId]
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT g.*, d.codigo AS decreto_codigo, d.nombre AS decreto_nombre
       FROM grados_escalafon g
       JOIN decretos d ON g.decreto_id = d.decreto_id
       WHERE g.grado_id = $1`,
      [id]
    )
    return result.rows[0] ?? null
  }

  static async create(data: Omit<GradoEscalafonCreationAttributes, "grado_id">, client?: any) {
    const result = await query(
      `INSERT INTO grados_escalafon (decreto_id, codigo, descripcion, orden)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.decreto_id, data.codigo, data.descripcion ?? null, data.orden ?? 0],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<GradoEscalafonCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (data.decreto_id  !== undefined) { fields.push(`decreto_id = $${i++}`);  values.push(data.decreto_id) }
    if (data.codigo      !== undefined) { fields.push(`codigo = $${i++}`);      values.push(data.codigo) }
    if (data.descripcion !== undefined) { fields.push(`descripcion = $${i++}`); values.push(data.descripcion) }
    if (data.orden       !== undefined) { fields.push(`orden = $${i++}`);       values.push(data.orden) }

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE grados_escalafon SET ${fields.join(", ")} WHERE grado_id = $${i} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM grados_escalafon WHERE grado_id = $1 RETURNING *", [id])
    return result.rows[0]
  }
}
