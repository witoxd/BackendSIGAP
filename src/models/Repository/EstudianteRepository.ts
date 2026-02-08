import { query } from "../../config/database"
import type { EstudianteCreationAttributes } from "../sequelize/Estudiante"


export class EstudianteRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT e.*, p.nombres, p.apellido_paterno, p.apellido_materno,td.tipo_documento, p.numero_documento, p.fecha_nacimiento
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY e.estudiante_id LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }



  static async findById(id: number) {
    const result = await query(
      `SELECT e.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento, p.numero_documento, p.fecha_nacimiento
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE e.estudiante_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByPersonaId(personaId: number) {
    const result = await query("SELECT * FROM estudiantes WHERE persona_id = $1", [personaId])
    return result.rows[0]
  }

  static async create(data: Omit<EstudianteCreationAttributes, "estudiante_id">, client?: any) {
    const result = await query(
      `INSERT INTO estudiantes (persona_id, fecha_ingreso, estado)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.persona_id, data.fecha_ingreso || new Date(), data.estado || "activo"],
      client
    )
    return result.rows[0]
  }
                    
  static async update(id: number, data: Partial<EstudianteCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "estudiante_id" && key !== "fecha_ingreso" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE estudiantes SET ${fields.join(", ")} WHERE estudiante_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async findByDocumento(numero_documento: string) {
    const result = await query(
      `SELECT e.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento, p.numero_documento, p.fecha_nacimiento
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE p.numero_documento ILIKE '%' || $1 || '%'`,
      [numero_documento],
    )
    return result.rows[0]
  } 

  static async delete(id: number) {
    const result = await query("DELETE FROM estudiantes WHERE estudiante_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM estudiantes")
    return Number.parseInt(result.rows[0].count)
  }
}
