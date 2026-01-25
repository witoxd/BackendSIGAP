import { query } from "../../config/database"
import type { Auditoria } from "../sequelize/Auditoria"

export class AuditoriaRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT a.*, u.username, p.nombres, p.apellido_paterno
       FROM auditoria a
       LEFT JOIN usuarios u ON a.usuario_id = u.usuario_id
       LEFT JOIN personas p ON u.persona_id = p.persona_id
       ORDER BY a.fecha_accion DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT a.*, u.username, p.nombres, p.apellido_paterno
       FROM auditoria a
       LEFT JOIN usuarios u ON a.usuario_id = u.usuario_id
       LEFT JOIN personas p ON u.persona_id = p.persona_id
       WHERE a.auditoria_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByUsuarioId(usuarioId: number, limit = 50, offset = 0) {
    const result = await query(
      "SELECT * FROM auditoria WHERE usuario_id = $1 ORDER BY fecha_accion DESC LIMIT $2 OFFSET $3",
      [usuarioId, limit, offset],
    )
    return result.rows
  }

  static async findByAccion(accion: string, limit = 50, offset = 0) {
    const result = await query(
      `SELECT a.*, u.username, p.nombres, p.apellido_paterno
       FROM auditoria a
       LEFT JOIN usuarios u ON a.usuario_id = u.usuario_id
       LEFT JOIN personas p ON u.persona_id = p.persona_id
       WHERE a.accion = $1
       ORDER BY a.fecha_accion DESC LIMIT $2 OFFSET $3`,
      [accion, limit, offset],
    )
    return result.rows
  }

  static async findByTabla(tabla: string, limit = 50, offset = 0) {
    const result = await query(
      `SELECT a.*, u.username, p.nombres, p.apellido_paterno
       FROM auditoria a
       LEFT JOIN usuarios u ON a.usuario_id = u.usuario_id
       LEFT JOIN personas p ON u.persona_id = p.persona_id
       WHERE a.tabla = $1
       ORDER BY a.fecha_accion DESC LIMIT $2 OFFSET $3`,
      [tabla, limit, offset],
    )
    return result.rows
  }


  static async count() {
    const result = await query("SELECT COUNT(*) FROM auditoria")
    return Number.parseInt(result.rows[0].count)
  }

  static async countByUsuario(usuarioId: number) {
    const result = await query("SELECT COUNT(*) FROM auditoria WHERE usuario_id = $1", [usuarioId])
    return Number.parseInt(result.rows[0].count)
  }
}
