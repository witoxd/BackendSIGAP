import { query } from "../../config/database"
import type { ProfesorContactoEmergenciaCreationAttributes } from "../sequelize/ProfesorContactoEmergencia"

export class ProfesorContactoEmergenciaRepository {

  static async findByProfesor(profesorId: number) {
    const result = await query(
      `SELECT
        contacto_emergencia_id,
        profesor_id,
        nombre,
        parentesco,
        telefono,
        celular
       FROM profesor_contactos_emergencia
       WHERE profesor_id = $1 AND activo = true
       ORDER BY contacto_emergencia_id`,
      [profesorId]
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT * FROM profesor_contactos_emergencia
       WHERE contacto_emergencia_id = $1 AND activo = true`,
      [id]
    )
    return result.rows[0] ?? null
  }

  static async create(
    data: Omit<ProfesorContactoEmergenciaCreationAttributes, "contacto_emergencia_id">,
    client?: any
  ) {
    const result = await query(
      `INSERT INTO profesor_contactos_emergencia
         (profesor_id, nombre, parentesco, telefono, celular, activo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [data.profesor_id, data.nombre, data.parentesco, data.telefono, data.celular ?? null],
      client
    )
    return result.rows[0]
  }

  static async bulkCreate(
    data: Omit<ProfesorContactoEmergenciaCreationAttributes, "contacto_emergencia_id">[],
    client?: any
  ) {
    if (data.length === 0) return []
    const values: any[] = []
    const placeholders: string[] = []

    data.forEach((item, i) => {
      const b = i * 5
      placeholders.push(`($${b+1}, $${b+2}, $${b+3}, $${b+4}, $${b+5}, true)`)
      values.push(item.profesor_id, item.nombre, item.parentesco, item.telefono, item.celular ?? null)
    })

    const result = await query(
      `INSERT INTO profesor_contactos_emergencia
         (profesor_id, nombre, parentesco, telefono, celular, activo)
       VALUES ${placeholders.join(", ")}
       RETURNING *`,
      values,
      client
    )
    return result.rows
  }

  static async update(id: number, data: Partial<ProfesorContactoEmergenciaCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values: any[] = []
    let p = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "contacto_emergencia_id" && key !== "profesor_id" && value !== undefined) {
        fields.push(`${key} = $${p++}`)
        values.push(value)
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE profesor_contactos_emergencia
       SET ${fields.join(", ")}
       WHERE contacto_emergencia_id = $${p} AND activo = true
       RETURNING *`,
      values,
      client
    )
    return result.rows[0] ?? null
  }

  static async delete(id: number) {
    const result = await query(
      `UPDATE profesor_contactos_emergencia
       SET activo = false
       WHERE contacto_emergencia_id = $1
       RETURNING *`,
      [id]
    )
    return result.rows[0] ?? null
  }
}
