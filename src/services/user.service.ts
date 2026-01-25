import { query, transaction } from "../config/database"
import type { PaginationParams, PaginatedResponse } from "../types"
import { NotFoundError, ConflictError, ForbiddenError, DatabaseError } from "../utils/AppError"

export class UserService {
  // Obtener usuario por ID con información completa
  async getUserById(userId: number) {
    try {
      const result = await query(
        `SELECT 
          u.usuario_id, u.username, u.email, u.activo, u.fecha_creacion,
          p.persona_id, p.nombres, p.apellido_paterno, p.apellido_materno,
          p.numero_documento, td.tipo_documento, p.fecha_nacimiento, p.genero,
          ARRAY_AGG(DISTINCT r.nombre) as roles
        FROM usuarios u
        INNER JOIN personas p ON u.persona_id = p.persona_id
        LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
        LEFT JOIN usuarios_role ur ON u.usuario_id = ur.usuario_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE u.usuario_id = $1
        GROUP BY u.usuario_id, p.persona_id, td.tipo_documento`,
        [userId],
      )

      if (result.rows.length === 0) {
        throw new NotFoundError("Usuario no encontrado")
      }

      const user = result.rows[0]
      // Excluir contraseña
      delete user.contraseña

      return user
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error
      }
      console.error("Error obteniendo usuario:", error)
      throw new DatabaseError("Error al obtener usuario")
    }
  }

  // Buscar usuarios con paginación y filtros
  async searchUsers(params: {
    query?: string
    nombres?: string
    numero_documento?: string
    role?: string
    pagination: PaginationParams
  }) {
    try {
      const { query: searchQuery, nombres, numero_documento, role, pagination } = params
      const { page, limit, sortBy = "usuario_id", sortOrder = "DESC" } = pagination
      const offset = (page - 1) * limit

      // Construir WHERE dinámicamente
      const conditions: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (searchQuery) {
        conditions.push(`(
          p.nombres ILIKE $${paramCount} OR 
          p.apellido_paterno ILIKE $${paramCount} OR 
          p.apellido_materno ILIKE $${paramCount} OR
          p.numero_documento ILIKE $${paramCount}
        )`)
        values.push(`%${searchQuery}%`)
        paramCount++
      }

      if (nombres) {
        conditions.push(`p.nombres ILIKE $${paramCount}`)
        values.push(`%${nombres}%`)
        paramCount++
      }

      if (numero_documento) {
        conditions.push(`p.numero_documento = $${paramCount}`)
        values.push(numero_documento)
        paramCount++
      }

      if (role) {
        conditions.push(`r.nombre = $${paramCount}`)
        values.push(role)
        paramCount++
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

      // Query para contar total
      const countQuery = `
        SELECT COUNT(DISTINCT u.usuario_id) as total
        FROM usuarios u
        INNER JOIN personas p ON u.persona_id = p.persona_id
        LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
        LEFT JOIN usuarios_role ur ON u.usuario_id = ur.usuario_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        ${whereClause}
      `

      const countResult = await query(countQuery, values)
      const total = Number.parseInt(countResult.rows[0].total)

      // Query para obtener datos
      const dataQuery = `
        SELECT 
          u.usuario_id, u.username, u.email, u.activo, u.fecha_creacion,
          p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento, p.numero_documento,
          ARRAY_AGG(DISTINCT r.nombre) as roles
        FROM usuarios u
        INNER JOIN personas p ON u.persona_id = p.persona_id
        LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
        LEFT JOIN usuarios_role ur ON u.usuario_id = ur.usuario_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        ${whereClause}
        GROUP BY u.usuario_id, p.nombres, p.apellido_paterno, p.apellido_materno, p.numero_documento, td.tipo_documento
        ORDER BY u.${sortBy} ${sortOrder}
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `

      const dataResult = await query(dataQuery, [...values, limit, offset])

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<any>
    } catch (error: any) {
      console.error("Error buscando usuarios:", error)
      throw new DatabaseError("Error al buscar usuarios")
    }
  }

  // Asignar rol de administrador (solo admin puede hacerlo)
  async assignAdminRole(targetUserId: number, adminUserId: number) {
    try {
      // Verificar que el usuario actual es admin
      const adminCheck = await query(
        `SELECT EXISTS(
          SELECT 1 FROM usuarios_role ur
          INNER JOIN roles r ON ur.role_id = r.role_id
          WHERE ur.usuario_id = $1 AND r.nombre = 'admin'
        ) as is_admin`,
        [adminUserId],
      )

      if (!adminCheck.rows[0].is_admin) {
        throw new ForbiddenError("Solo administradores pueden asignar roles de admin")
      }

      // Verificar que el usuario objetivo existe
      const userCheck = await query("SELECT usuario_id FROM usuarios WHERE usuario_id = $1", [targetUserId])

      if (userCheck.rows.length === 0) {
        throw new NotFoundError("Usuario no encontrado")
      }

      // Obtener ID del rol administrador
      const roleResult = await query("SELECT role_id FROM roles WHERE nombre = $1", ["admin"])

      if (roleResult.rows.length === 0) {
        throw new NotFoundError("Rol administrador no encontrado")
      }

      const adminRoleId = roleResult.rows[0].role_id

      // Verificar si ya tiene el rol
      const hasRoleCheck = await query(
        "SELECT usuario_role_id FROM usuarios_role WHERE usuario_id = $1 AND role_id = $2",
        [targetUserId, adminRoleId],
      )

      if (hasRoleCheck.rows.length > 0) {
        throw new ConflictError("El usuario ya tiene el rol de administrador")
      }

      // Asignar rol
      await query("INSERT INTO usuarios_role (usuario_id, role_id) VALUES ($1, $2)", [targetUserId, adminRoleId])

      // Registrar en auditoría
      await query(
        `INSERT INTO auditoria (tabla_nombre, accion, usuario_id, detalle)
         VALUES ($1, $2, $3, $4)`,
        ["usuarios_role", "ASSIGN_ADMIN", adminUserId, JSON.stringify({ targetUserId, roleId: adminRoleId })],
      )

      return { message: "Rol de administrador asignado exitosamente" }
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof ConflictError) {
        throw error
      }
      console.error("Error asignando rol admin:", error)
      throw new DatabaseError("Error al asignar rol de administrador")
    }
  }

  // Transferir rol de administrador (cambio de rector)
  async transferAdminRole(fromUserId: number, toUserId: number) {
    try {
      // Verificar que ambos usuarios existen
      const usersCheck = await query("SELECT usuario_id FROM usuarios WHERE usuario_id IN ($1, $2)", [
        fromUserId,
        toUserId,
      ])

      if (usersCheck.rows.length !== 2) {
        throw new NotFoundError("Uno o ambos usuarios no encontrados")
      }

      // Obtener ID del rol administrador
      const roleResult = await query("SELECT role_id FROM roles WHERE nombre = $1", ["admin"])

      if (roleResult.rows.length === 0) {
        throw new NotFoundError("Rol administrador no encontrado")
      }

      const adminRoleId = roleResult.rows[0].role_id

      await transaction(async (client) => {
        // Remover rol admin del usuario actual
        await client.query("DELETE FROM usuarios_role WHERE usuario_id = $1 AND role_id = $2", [fromUserId, adminRoleId])

        // Asignar rol admin al nuevo usuario (si no lo tiene)
        await client.query(
          `INSERT INTO usuarios_role (usuario_id, role_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [toUserId, adminRoleId],
        )

        // Registrar en auditoría
        await client.query(
          `INSERT INTO auditoria (tabla_nombre, accion, usuario_id, detalle)
           VALUES ($1, $2, $3, $4)`,
          ["usuarios_role", "TRANSFER_ADMIN", fromUserId, JSON.stringify({ fromUserId, toUserId, roleId: adminRoleId })],
        )
      })

      return { message: "Rol de administrador transferido exitosamente" }
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error
      }
      console.error("Error transfiriendo rol admin:", error)
      throw new DatabaseError("Error al transferir rol de administrador")
    }
  }

  // Activar/desactivar usuario
  async toggleUserStatus(userId: number, activo: boolean) {
    try {
      const result = await query("UPDATE usuarios SET activo = $1 WHERE usuario_id = $2 RETURNING usuario_id", [
        activo,
        userId,
      ])

      if (result.rows.length === 0) {
        throw new NotFoundError("Usuario no encontrado")
      }

      return { message: `Usuario ${activo ? "activado" : "desactivado"} exitosamente` }
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error
      }
      console.error("Error actualizando estado de usuario:", error)
      throw new DatabaseError("Error al actualizar estado del usuario")
    }
  }
}
