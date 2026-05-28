import { query } from "../../config/database"
import { ReemplazoProfesorCreationAttributes } from "../sequelize/ReemplazoProfesor"

export class ReemplazoProfesorRepository {
  static async findByProfesorId(profesorId: number) {
    const realizados = await query(
      `SELECT r.*,
         concat(p2.nombres,' ',p2.apellido_paterno,' ',coalesce(p2.apellido_materno,'')) AS nombre_reemplazado
       FROM reemplazos_profesor r
       INNER JOIN profesores pr2 ON r.reemplaza_a_profesor_id = pr2.profesor_id
       INNER JOIN docente d2      ON pr2.docente_id            = d2.docente_id
       INNER JOIN personas p2     ON d2.persona_id             = p2.persona_id
       WHERE r.profesor_id = $1
       ORDER BY r.fecha_inicio DESC`,
      [profesorId]
    )
    const recibidos = await query(
      `SELECT r.*,
         concat(p1.nombres,' ',p1.apellido_paterno,' ',coalesce(p1.apellido_materno,'')) AS nombre_reemplazante
       FROM reemplazos_profesor r
       INNER JOIN profesores pr1 ON r.profesor_id              = pr1.profesor_id
       INNER JOIN docente d1     ON pr1.docente_id             = d1.docente_id
       INNER JOIN personas p1    ON d1.persona_id              = p1.persona_id
       WHERE r.reemplaza_a_profesor_id = $1
       ORDER BY r.fecha_inicio DESC`,
      [profesorId]
    )
    return { realizados: realizados.rows, recibidos: recibidos.rows }
  }

  static async findActivo(reemplazaAProfesorId: number) {
    const result = await query(
      `SELECT * FROM reemplazos_profesor
       WHERE reemplaza_a_profesor_id = $1 AND fecha_fin IS NULL
       LIMIT 1`,
      [reemplazaAProfesorId]
    )
    return result.rows[0] ?? null
  }

  static async create(data: Omit<ReemplazoProfesorCreationAttributes, "reemplazo_id">, client?: any) {
    const result = await query(
      `INSERT INTO reemplazos_profesor (profesor_id, reemplaza_a_profesor_id, fecha_inicio, fecha_fin, motivo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.profesor_id, data.reemplaza_a_profesor_id, data.fecha_inicio, data.fecha_fin ?? null, data.motivo ?? null],
      client
    )
    return result.rows[0]
  }

  static async cerrar(reemplazoId: number, fechaFin: string, client?: any) {
    const result = await query(
      `UPDATE reemplazos_profesor SET fecha_fin = $1 WHERE reemplazo_id = $2 RETURNING *`,
      [fechaFin, reemplazoId],
      client
    )
    return result.rows[0] ?? null
  }

  static async findById(reemplazoId: number) {
    const result = await query(
      `SELECT * FROM reemplazos_profesor WHERE reemplazo_id = $1`,
      [reemplazoId]
    )
    return result.rows[0] ?? null
  }
}
