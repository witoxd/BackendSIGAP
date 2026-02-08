import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query, transaction } from "../config/database"
import { type JwtPayload, RoleType } from "../types"
import { ConflictError, UnauthorizedError, NotFoundError, DatabaseError } from "../utils/AppError"

export class AuthService {
  // Registrar un nuevo usuario
  async register(userData: {
    email: string
    username: string
    contraseña: string
    nombres: string
    apellido_paterno?: string
    apellido_materno?: string
    tipo_documento_id: number
    numero_documento: string
    fecha_nacimiento: string
    genero?: string
    role: string
  }) {
    try {
      // Verificar si el email ya existe
      const emailCheck = await query("SELECT usuario_id FROM usuarios WHERE email = $1", [userData.email])

      if (emailCheck.rows.length > 0) {
        throw new ConflictError("El email ya está registrado")
      }

      // Verificar si el username ya existe
      const usernameCheck = await query("SELECT usuario_id FROM usuarios WHERE username = $1", [userData.username])

      if (usernameCheck.rows.length > 0) {
        throw new ConflictError("El username ya está en uso")
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(userData.contraseña, 12)

      // Usar transacción para crear persona, usuario y asignar rol
      const result = await transaction(async (client) => {
        // 1. Crear persona
        const personaResult = await client.query(
          `INSERT INTO personas (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,  fecha_nacimiento, genero)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING persona_id`,
          [
            userData.nombres,
            userData.apellido_paterno || null,
            userData.apellido_materno || null,
            userData.tipo_documento_id,
            userData.numero_documento,
            userData.fecha_nacimiento,
            userData.genero || null,
          ],
        )

        const personaId = personaResult.rows[0].persona_id

        // 3. Crear usuario
        const usuarioResult = await client.query(
          `INSERT INTO usuarios (persona_id, username, contraseña, email, activo)
           VALUES ($1, $2, $3, $4, true)
           RETURNING usuario_id, email, username, fecha_creacion`,
          [personaId, userData.username, hashedPassword, userData.email],
        )

        const usuario = usuarioResult.rows[0]

        // 4. Obtener rol
        const roleResult = await client.query("SELECT role_id FROM roles WHERE nombre = $1", [userData.role])

        if (roleResult.rows.length === 0) {
          throw new NotFoundError(`Rol '${userData.role}' no encontrado`)
        }

        const roleId = roleResult.rows[0].role_id

        // 5. Asignar rol al usuario
        await client.query("INSERT INTO usuarios_role (usuario_id, role_id) VALUES ($1, $2)", [
          usuario.usuario_id,
          roleId,
        ])

        // 6. Crear registro específico según el rol
        await this.createRoleSpecificRecord(client, personaId, userData.role)

        return {
          userId: usuario.usuario_id,
          personaId,
          email: usuario.email,
          username: usuario.username,
          role: userData.role,
        }
      })

      return result
    } catch (error: any) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error
      }
      console.error("Error en registro:", error)
      throw new DatabaseError("Error al registrar usuario")
    }
  }

  // Crear registro específico según el rol
  private async createRoleSpecificRecord(client: any, personaId: number, role: string) {
    if (!role) {
      throw new Error("El rol es requerido")
    }

    try {

          await client.query("INSERT INTO administrativos (persona_id, cargo) VALUES ($1, 'gestor')", [personaId])
      
    } catch (error) {
      console.error("Error creando registro específico de rol:", error)
      throw error
    }
  }

  // Login
  async login(email: string, contraseña: string) {
    try {
      // Buscar usuario con sus roles
      const result = await query(
        `SELECT 
          u.usuario_id, u.persona_id, u.username, u.email, u.contraseña, u.activo,
          ARRAY_AGG(r.nombre) as roles
        FROM usuarios u
        LEFT JOIN usuarios_role ur ON u.usuario_id = ur.usuario_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE u.email = $1
        GROUP BY u.usuario_id`,
        [email],
      )

      if (result.rows.length === 0) {
        throw new UnauthorizedError("Credenciales inválidas")
      }

      const user = result.rows[0]

      // Verificar si el usuario está activo
      if (!user.activo) {
        throw new UnauthorizedError("Usuario inactivo. Contacte al administrador.")
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña)

      if (!isPasswordValid) {
        throw new UnauthorizedError("Credenciales inválidas")
      }

      // Generar token JWT
      const token = this.generateToken({
        userId: user.usuario_id,
        personaId: user.persona_id,
        email: user.email,
        roles: user.roles || [],
      })

      return {
        token,
        user: {
          id: user.usuario_id,
          personaId: user.persona_id,
          username: user.username,
          email: user.email,
          roles: user.roles || [],
        },
      }
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        throw error
      }
      console.error("Error en login:", error)
      throw new DatabaseError("Error al iniciar sesión")
    }
  }

  // Generar token JWT
  private generateToken(payload: JwtPayload): string {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET no configurado")
    }

    const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d"

    return jwt.sign(payload, secret, {
      expiresIn,
    } as any)
  }

  // Cambiar contraseña
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      // Obtener contraseña actual
      const result = await query("SELECT contraseña FROM usuarios WHERE usuario_id = $1", [userId])

      if (result.rows.length === 0) {
        throw new NotFoundError("Usuario no encontrado")
      }

      const user = result.rows[0]

      // Verificar contraseña actual
      const isPasswordValid = await bcrypt.compare(currentPassword, user.contraseña)

      if (!isPasswordValid) {
        throw new UnauthorizedError("Contraseña actual incorrecta")
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Actualizar contraseña
      await query("UPDATE usuarios SET contraseña = $1 WHERE usuario_id = $2", [hashedPassword, userId])

      return { message: "Contraseña actualizada exitosamente" }
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
        throw error
      }
      console.error("Error al cambiar contraseña:", error)
      throw new DatabaseError("Error al cambiar contraseña")
    }
  }
}
