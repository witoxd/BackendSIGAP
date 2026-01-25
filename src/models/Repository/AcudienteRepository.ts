import { query } from "../../config/database"
import { AcudienteCreationAttributes } from "../sequelize/Acudiente"
import { AcudienteEstudianteCreationAttributes } from "../sequelize/AcudienteEstudiante"


export class AcudienteRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT a.*, p.nombres, p.apellido_paterno, p.apellido_materno,  td.tipo_documento,
              p.numero_documento
       FROM acudientes a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY p.apellido_paterno, p.nombres LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT a.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento,
              p.numero_documento
       FROM acudientes a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE a.acudiente_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByPersonaId(personaId: number) {
    const result = await query("SELECT * FROM acudientes WHERE persona_id = $1", [personaId])
    return result.rows[0]
  }

  static async findByEstudiante(estudianteId: number) {
    const result = await query(
      `SELECT a.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento
              p.numero_documento,
              ae.tipo_relacion, ae.es_principal
       FROM acudientes a
       INNER JOIN acudiente_estudiante ae ON a.acudiente_id = ae.acudiente_id
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE ae.estudiante_id = $1
       ORDER BY ae.es_principal DESC, p.apellido_paterno`,
      [estudianteId],
    )
    return result.rows
  }

  static async create(data: Omit<AcudienteCreationAttributes, "acudiente_id">, client?: any) {
    const result = await query(
      `INSERT INTO acudientes (persona_id, parentesco)
       VALUES ($1, $2) RETURNING *`,
      [data.persona_id, data.parentesco],
      client
    )
    return result.rows[0]
  }

  static async update(id: number, data: Partial<AcudienteCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "acudiente_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE acudientes SET ${fields.join(", ")} WHERE acudiente_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM acudientes WHERE acudiente_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async assignToEstudiante(data: Omit<AcudienteEstudianteCreationAttributes, "acudiente_estudiante_id">) {
    const result = await query(
      `INSERT INTO acudiente_estudiante (estudiante_id, acudiente_id, tipo_relacion, es_principal)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.estudiante_id, data.acudiente_id, data.tipo_relacion, data.es_principal],
    )
    return result.rows[0]
  }

  static async removeFromEstudiante(estudianteId: number, acudienteId: number) {
    const result = await query(
      "DELETE FROM acudiente_estudiante WHERE estudiante_id = $1 AND acudiente_id = $2 RETURNING *",
      [estudianteId, acudienteId],
    )
    return result.rows[0]
  }
}
