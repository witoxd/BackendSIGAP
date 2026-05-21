import { query } from "../../config/database"

export interface CreateSuspensionDTO {
  estudiante_id: number
  matricula_id?: number | null
  motivo: string
  fecha_inicio: string
  fecha_fin: string
  creado_por?: number | null
}

export class SuspensionRepository {
  static async findByEstudiante(estudianteId: number) {
    const result = await query(
      `SELECT
        s.suspension_id,
        s.estudiante_id,
        s.matricula_id,
        s.motivo,
        s.fecha_inicio,
        s.fecha_fin,
        s.created_at,
        u.username AS creado_por_nombre,
        CURRENT_DATE BETWEEN s.fecha_inicio AND s.fecha_fin AS vigente
      FROM suspensiones s
      LEFT JOIN usuarios u ON s.creado_por = u.usuario_id
      WHERE s.estudiante_id = $1
      ORDER BY s.fecha_inicio DESC`,
      [estudianteId]
    )
    return result.rows
  }

  static async findVigenteByEstudiante(estudianteId: number) {
    const result = await query(
      `SELECT suspension_id, motivo, fecha_inicio, fecha_fin
       FROM suspensiones
       WHERE estudiante_id = $1
         AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
       LIMIT 1`,
      [estudianteId]
    )
    return result.rows[0] ?? null
  }

  static async create(data: CreateSuspensionDTO, client?: any) {
    const result = await query(
      `INSERT INTO suspensiones
         (estudiante_id, matricula_id, motivo, fecha_inicio, fecha_fin, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.estudiante_id,
        data.matricula_id ?? null,
        data.motivo,
        data.fecha_inicio,
        data.fecha_fin,
        data.creado_por ?? null,
      ],
      client
    )
    return result.rows[0]
  }

  static async delete(suspensionId: number) {
    const result = await query(
      "DELETE FROM suspensiones WHERE suspension_id = $1 RETURNING *",
      [suspensionId]
    )
    return result.rows[0] ?? null
  }
}
