import { query } from "../../config/database"
import { DocenteCreationAttributes } from "../sequelize/Docente"

export class DocenteRepository {
  static async findById(docenteId: number) {
    const result = await query(
      `SELECT d.*, j.nombre AS jornada_nombre
       FROM docente d
       LEFT JOIN jornadas j ON d.jornada_id = j.jornada_id
       WHERE d.docente_id = $1`,
      [docenteId]
    )
    return result.rows[0] ?? null
  }

  static async findByPersonaId(personaId: number) {
    const result = await query(
      `SELECT d.*, j.nombre AS jornada_nombre
       FROM docente d
       LEFT JOIN jornadas j ON d.jornada_id = j.jornada_id
       WHERE d.persona_id = $1`,
      [personaId]
    )
    return result.rows[0] ?? null
  }

  static async create(data: Omit<DocenteCreationAttributes, "docente_id">, client?: any) {
    const result = await query(
      `INSERT INTO docente (persona_id, sede, jornada_id, tipo_contrato, estado, fecha_contratacion, decreto_id, titulo, area, posgrado, grado_escalafon_id, fecha_nombramiento, numero_resolucion, perfil_profesional)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        data.persona_id,
        data.sede ?? null,
        data.jornada_id ?? null,
        data.tipo_contrato ?? null,
        data.estado ?? "activo",
        data.fecha_contratacion ?? new Date(),
        data.decreto_id ?? null,
        data.titulo ?? null,
        data.area ?? null,
        data.posgrado ?? null,
        data.grado_escalafon_id ?? null,
        data.fecha_nombramiento ?? null,
        data.numero_resolucion ?? null,
        data.perfil_profesional ?? null,
      ],
      client
    )
    return result.rows[0]
  }

  static async update(docenteId: number, data: Partial<Omit<DocenteCreationAttributes, "docente_id" | "persona_id">>, client?: any) {
    const allowed = ["sede", "jornada_id", "tipo_contrato", "estado", "fecha_contratacion", "decreto_id", "titulo", "area", "posgrado", "grado_escalafon_id", "fecha_nombramiento", "numero_resolucion", "perfil_profesional"]
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    for (const key of allowed) {
      if (key in data && (data as Record<string, unknown>)[key] !== undefined) {
        fields.push(`${key} = $${idx}`)
        values.push((data as Record<string, unknown>)[key])
        idx++
      }
    }

    if (fields.length === 0) return null

    values.push(docenteId)
    const result = await query(
      `UPDATE docente SET ${fields.join(", ")} WHERE docente_id = $${idx} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async updateEstado(docenteId: number, estado: "activo" | "inactivo", client?: any) {
    const result = await query(
      `UPDATE docente SET estado = $1 WHERE docente_id = $2 RETURNING *`,
      [estado, docenteId],
      client
    )
    return result.rows[0]
  }
}
