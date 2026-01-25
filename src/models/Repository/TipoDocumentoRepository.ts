import { query } from "../../config/database"
import  { TipoDocumentoCreationAttributes } from "../sequelize/TipoDocumento"

export class TipoDocumentoRepository {
  static async findAll() {
    const result = await query("SELECT * FROM tipo_documento ORDER BY tipo_documento")
    return result.rows
  }

  static async findById(id: number) {
    const result = await query("SELECT * FROM tipo_documento WHERE tipo_documento_id = $1", [id])
    return result.rows[0]
  }

  static async findByName(tipo_documento: string) {
    const result = await query("SELECT * FROM tipo_documento WHERE tipo_documento = $1", [tipo_documento])
    return result.rows[0]
  }

  static async create(data: Omit<TipoDocumentoCreationAttributes, "tipo_documento_id">, client?: any) {
    const result = await query(
      `INSERT INTO tipo_documento ( tipo_documento, nombre_documento)
       VALUES ($1, $2) RETURNING *`,
      [data.tipo_documento, data.nombre_documento],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<TipoDocumentoCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "tipo_documento_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE tipo_documento SET ${fields.join(", ")} WHERE tipo_documento_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM tipo_documento WHERE tipo_documento_id = $1 RETURNING *", [id])
    return result.rows[0]
  }
}
