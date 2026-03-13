import { query } from "../../config/database"
import type { ViviendaEstudianteCreationAttributes } from "../sequelize/ViviendaEstudiante"

export class ViviendaEstudianteRepository {

  static async findByEstudianteId(estudianteId: number) {
    const result = await query(
      "SELECT * FROM vivienda_estudiante WHERE estudiante_id = $1",
      [estudianteId]
    )
    return result.rows[0] ?? null
  }

  // ----------------------------------------------------------
  // La vivienda también se llena gradualmente y es 1:1 con
  // el estudiante, así que ON CONFLICT (estudiante_id) es ideal.
  //
  // Diferencia con FichaEstudiante: aquí no hay JOIN con personas
  // porque los datos de vivienda son puramente socioeconómicos,
  // no tienen relación con campos de la tabla personas.
  // ----------------------------------------------------------
  static async upsert(
    estudianteId: number,
    data: Partial<Omit<ViviendaEstudianteCreationAttributes, "vivienda_id" | "estudiante_id">>,
    client?: any
  ) {
    const fields = Object.keys(data).filter(
      (k) => data[k as keyof typeof data] !== undefined
    )

    if (fields.length === 0) return null

    const values = fields.map((f) => data[f as keyof typeof data])

    const insertColumns    = ["estudiante_id", ...fields].join(", ")
    const insertPlaceholders = ["$1", ...fields.map((_, i) => `$${i + 2}`)].join(", ")
    const updateClause     = fields.map((f, i) => `${f} = $${i + 2}`).join(", ")

    const result = await query(
      `INSERT INTO vivienda_estudiante (${insertColumns})
       VALUES (${insertPlaceholders})
       ON CONFLICT (estudiante_id)
       DO UPDATE SET ${updateClause}, updated_at = NOW()
       RETURNING *`,
      [estudianteId, ...values],
      client
    )
    return result.rows[0]
  }

  static async delete(estudianteId: number) {
    const result = await query(
      "DELETE FROM vivienda_estudiante WHERE estudiante_id = $1 RETURNING *",
      [estudianteId]
    )
    return result.rows[0] ?? null
  }
}