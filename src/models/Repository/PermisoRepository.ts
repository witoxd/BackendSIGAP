import { query } from "../../config/database"
import type { Permiso } from "../../types"

export class PermisoRepository {
  static async findAll(limit = 100, offset = 0) {
    const result = await query("SELECT * FROM permisos ORDER BY recurso, accion LIMIT $1 OFFSET $2", [limit, offset])
    return result.rows
  }

  static async findById(id: number) {
    const result = await query("SELECT * FROM permisos WHERE permiso_id = $1", [id])
    return result.rows[0]
  }

  static async findByRole(roleId: number) {
    const result = await query(
      `SELECT p.* FROM permisos p
       INNER JOIN role_permiso rp ON p.permiso_id = rp.permiso_id
       WHERE rp.role_id = $1
       ORDER BY p.recurso, p.accion`,
      [roleId],
    )
    return result.rows
  }

  static async create(data: Omit<Permiso, "permiso_id">) {
    const result = await query(
      `INSERT INTO permisos (nombre, descripcion, recurso, accion)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.nombre, data.descripcion, data.recurso, data.accion],
    )
    return result.rows[0]
  }

  static async assignToRole(roleId: number, permisoId: number) {
    const result = await query(
      `INSERT INTO role_permisos (role_id, permiso_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [roleId, permisoId],
    )
    return result.rows[0]
  }

  static async removeFromRole(roleId: number, permisoId: number) {
    const result = await query(
      `DELETE FROM role_permisos
       WHERE role_id = $1 AND permiso_id = $2 
       RETURNING *`,
      [roleId, permisoId],
    )
    return result.rows[0]
  }

  static async checkPermission(roleId: number, recurso: string, accion: string): Promise<boolean> {
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM role_permisos rp
        INNER JOIN permisos p ON rp.permiso_id = p.permiso_id
        WHERE rp.role_id = $1 AND p.recurso = $2 AND (p.accion = $3 OR p.accion = 'manage')
      ) as tiene_permiso`,
      [roleId, recurso, accion],
    )
    return result.rows[0].tiene_permiso
  }
}
