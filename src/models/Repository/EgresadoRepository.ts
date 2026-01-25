import { query } from "../../config/database"
import { EgresadoCreationAttributes } from "../sequelize/Egresado"

export class EgresadoRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT eg.*, e.*, p.nombres, p.apellido_paterno, p.apellido_materno,
              p.numero_documento, td.tipo_documento
       FROM egresados eg
       INNER JOIN estudiantes e ON eg.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY eg.fecha_grado DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT eg.*, e.*, p.nombres, p.apellido_paterno, p.apellido_materno,
              td.tipo_documento, p.numero_documento
       FROM egresados eg
       INNER JOIN estudiantes e ON eg.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE eg.egresado_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByEstudianteId(estudianteId: number) {
    const result = await query("SELECT * FROM egresados WHERE estudiante_id = $1", [estudianteId])
    return result.rows[0]
  }

  static async findByYear(year: number) {
    const result = await query(
      `SELECT eg.*, e.*, p.nombres, p.apellido_paterno, p.apellido_materno
       FROM egresados eg
       INNER JOIN estudiantes e ON eg.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       WHERE EXTRACT(YEAR FROM eg.fecha_grado) = $1
       ORDER BY eg.fecha_grado DESC`,
      [year],
    )
    return result.rows
  }

  static async create(data: Omit<EgresadoCreationAttributes, "egresado_id">, client?: any) {
    const result = await query(
      `INSERT INTO egresados (estudiante_id, fecha_grado)
       VALUES ($1, $2) RETURNING *`,
      [data.estudiante_id, data.fecha_grado || new Date()],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<EgresadoCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "egresado_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE egresados SET ${fields.join(", ")} WHERE egresado_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM egresados WHERE egresado_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM egresados")
    return Number.parseInt(result.rows[0].count)
  }
}
