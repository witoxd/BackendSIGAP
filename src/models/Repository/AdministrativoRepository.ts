import { query } from "../../config/database"
import { AdministrativoCreationAttributes } from "../sequelize/Administrativo"


export class AdministrativoRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT a.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento, p.numero_documento
       FROM administrativos a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY a.administrativo_id LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT a.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento, p.numero_documento
       FROM administrativos a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE a.administrativo_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByPersonaId(personaId: number) {
    const result = await query(`SELECT * FROM administrativos WHERE persona_id = $1`, [personaId])
    return result.rows[0]
  }
  

  static async create(data: Omit<AdministrativoCreationAttributes, "administrativo_id">, client?: any) {
    const result = await query(
      `INSERT INTO administrativos (persona_id , cargo, fecha_contratacion, estado)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.persona_id, data.cargo, data.fecha_contratacion || new Date(),  data.estado || true],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<AdministrativoCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "administrativo_id" && key !== "fecha_contratacion" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE administrativos SET ${fields.join(", ")} WHERE administrativo_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query(`DELETE FROM administrativos WHERE administrativo_id = $1 RETURNING *`, [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query(`SELECT COUNT(*) FROM administrativos`)
    return Number.parseInt(result.rows[0].count)
  }
}
