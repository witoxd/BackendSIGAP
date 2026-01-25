import { query } from "../../config/database"
import type { UsuarioCreationAttributes } from "../sequelize/Usuario"
import bcrypt from "bcryptjs"

export class UserRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT u.*, p.nombres, p.apellido_paterno, p.apellido_materno 
       FROM usuarios u 
       LEFT JOIN personas p ON u.persona_id = p.persona_id 
       ORDER BY u.usuario_id LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT u.*, p.nombres, p.apellido_paterno, p.apellido_materno 
       FROM usuarios u 
       LEFT JOIN personas p ON u.persona_id = p.persona_id 
       WHERE u.usuario_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByEmail(email: string) {
    const result = await query(
      `SELECT u.*, p.nombres, p.apellido_paterno, p.apellido_materno 
       FROM usuarios u 
       LEFT JOIN personas p ON u.persona_id = p.persona_id 
       WHERE u.email = $1`,
      [email],
    )
    return result.rows[0]
  }

  static async findByUsername(username: string) {
    const result = await query("SELECT * FROM usuarios WHERE username = $1", [username])
    return result.rows[0]
  }

  static async create(data: Omit<UsuarioCreationAttributes, "usuario_id" | "fecha_creacion" | "activo">) {
    const hashedPassword = await bcrypt.hash(data.contraseña, 10)
    const result = await query(
      `INSERT INTO usuarios (persona_id, username, email, contraseña, activo)
       VALUES ($1, $2, $3, $4, true) RETURNING *`,
      [data.persona_id, data.username, data.email, hashedPassword],
    )
    return result.rows[0]
  }

  static async updatePassword(id: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const result = await query("UPDATE usuarios SET contraseña = $1 WHERE usuario_id = $2 RETURNING *", [
      hashedPassword,
      id,
    ])
    return result.rows[0]
  }

  static async toggleActive(id: number, activo: boolean) {
    const result = await query("UPDATE usuarios SET activo = $1 WHERE usuario_id = $2 RETURNING *", [activo, id])
    return result.rows[0]
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // static async getUserRoles(userId: number) {
  //   const result = await query(
  //     `SELECT r.nombre FROM roles r
  //      INNER JOIN usuario_role ur ON r.role_id = ur.role_id
  //      WHERE ur.usuario_id = $1`,
  //     [userId],
  //   )
  //   return result.rows.map((row) => row.nombre)
  // }

  static async assignRole(userId: number, roleId: number) {
    const result = await query(
      `INSERT INTO usuarios_role (usuario_id, role_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
      [userId, roleId],
    )
    return result.rows[0]
  }

  static async removeRole(userId: number, roleId: number) {
    const result = await query("DELETE FROM usuarios_role WHERE usuario_id = $1 AND role_id = $2 RETURNING *", [
      userId,
      roleId,
    ])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM usuarios")
    return Number.parseInt(result.rows[0].count)
  }
}
