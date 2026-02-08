import { query } from "../../config/database"
import { ProfesorCreationAttributes } from "../sequelize/Profesor"


export class ProfesorRepository  {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT pr.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento, p.numero_documento
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY pr.profesor_id LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT pr.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento ,p.numero_documento
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE pr.profesor_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByPersonaId(personaId: number) {
    const result = await query("SELECT * FROM profesores WHERE persona_id = $1", [personaId])
    return result.rows[0]
  }

  static async create(data: Omit<ProfesorCreationAttributes, "profesor_id">, client?: any) {
    const result = await query(
      `INSERT INTO profesores (persona_id, fecha_contratacion, estado)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.persona_id,  data.fecha_contratacion || new Date(), data.estado || "activo"],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<ProfesorCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "profesor_id" && key !== "fecha_contratacion" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE profesores SET ${fields.join(", ")} WHERE profesor_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM profesores WHERE profesor_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM profesores")
    return Number.parseInt(result.rows[0].count)
  }
}
