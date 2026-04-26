import { query } from "../../config/database"
import type { ProcesoInscripcionCreationAttributes } from "../sequelize/ProcesoInscripcion"

export class ProcesoInscripcionRepository {

  static async findAll() {
    const result = await query(
      `SELECT pi.*, pm.anio, pm.descripcion AS periodo_descripcion
       FROM procesos_inscripcion pi
       INNER JOIN periodos_matricula pm ON pi.periodo_id = pm.periodo_id
       ORDER BY pi.fecha_inicio_inscripcion DESC`
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT * FROM procesos_inscripcion WHERE proceso_id = $1`,
      [id]
    )
    return result.rows[0] ?? null
  }

  static async findByPeriodo(periodoId: number) {
    const result = await query(
      `SELECT * FROM procesos_inscripcion
       WHERE periodo_id = $1
       ORDER BY fecha_inicio_inscripcion ASC`,
      [periodoId]
    )
    return result.rows
  }

  // ----------------------------------------------------------
  // findVigente — devuelve el proceso cuya ventana de fechas
  // contiene la fecha actual, dentro del período activo.
  // ----------------------------------------------------------
  static async findVigente() {
    const result = await query(
      `SELECT pi.*
       FROM procesos_inscripcion pi
       INNER JOIN periodos_matricula pm ON pi.periodo_id = pm.periodo_id
       WHERE pm.activo = true
         AND pi.activo = true
         AND CURRENT_DATE BETWEEN pi.fecha_inicio_inscripcion AND pi.fecha_fin_inscripcion
       LIMIT 1`
    )
    return result.rows[0] ?? null
  }

  static async create(
    data: Omit<ProcesoInscripcionCreationAttributes, "proceso_id">,
    client?: any
  ) {
    const result = await query(
      `INSERT INTO procesos_inscripcion
         (periodo_id, nombre, fecha_inicio_inscripcion, fecha_fin_inscripcion, activo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.periodo_id,
        data.nombre,
        data.fecha_inicio_inscripcion,
        data.fecha_fin_inscripcion,
        data.activo ?? true,
      ],
      client
    )
    return result.rows[0]
  }

  static async update(
    id: number,
    data: Partial<Omit<ProcesoInscripcionCreationAttributes, "proceso_id">>,
    client?: any
  ) {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE procesos_inscripcion
       SET ${fields.join(", ")}
       WHERE proceso_id = $${paramCount}
       RETURNING *`,
      values,
      client
    )
    return result.rows[0] ?? null
  }

  static async delete(id: number) {
    const result = await query(
      `DELETE FROM procesos_inscripcion WHERE proceso_id = $1 RETURNING *`,
      [id]
    )
    return result.rows[0] ?? null
  }
}
