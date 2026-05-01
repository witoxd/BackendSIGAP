import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query, transaction } from "../config/database"
import { type JwtPayload, RoleType } from "../types"
import { ConflictError, UnauthorizedError, NotFoundError, DatabaseError } from "../utils/AppError"
import { UsuarioCreationAttributes } from "../models/sequelize/Usuario"
import { PersonaCreationAttributes } from "../models/sequelize/Persona"
import { PersonaRepository } from "../models/Repository/PersonaRepository"
import { UserRepository } from "../models/Repository/UserRepository"
import { parsePostgresArray } from "../utils/parsePostgresArray"
export class AuthService {
  // Registrar un nuevo usuario

  async personaExisting(personaID: number) {

    const [personaResult] = await Promise.all([
      query("SELECT persona_id FROM personas WHERE persona_id = $1", [personaID]),
    ])

    if (personaResult.rows.length === 0) {
      throw new NotFoundError(`Persona con ID '${personaID}' no encontrada`)
    }

    const existingUserByPersona = await query("SELECT usuario_id FROM usuarios WHERE persona_id = $1", [personaID])

    if (existingUserByPersona.rows.length > 0) {
      throw new ConflictError("La persona ya tiene un usuario asignado")
    }
  }

  async checkEmailAndUsername(email: string, username: string) {
    const run = async (txClient: any) => {
      const [emailCheck, usernameCheck] = await Promise.all([
        query("SELECT usuario_id FROM usuarios WHERE email = $1", [email], txClient),
        query("SELECT usuario_id FROM usuarios WHERE username = $1", [username], txClient),
      ])

      if (emailCheck.rows.length > 0) {
        throw new ConflictError("El email ya está registrado")
      }

      if (usernameCheck.rows.length > 0) {
        throw new ConflictError("El username ya está en uso")
      }
    }

    try {
      await transaction(run)
    } catch (error: any) {
      if (error instanceof ConflictError) {
        throw error
      }
      console.error("Error verificando email y username:", error)
      throw new DatabaseError("Error al verificar email y username")
    }
  }

  async checkRoleExists(roleName: string) {
    const run = async (txClient: any) => {
      const roleResult = await query("SELECT role_id FROM roles WHERE nombre = $1", [roleName], txClient)

      if (roleResult.rows.length === 0) {
        throw new NotFoundError(`Rol '${roleName}' no encontrado`)
      }

      return roleResult.rows[0].role_id
    }

    try {
      return await transaction(run)
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error
      }
      console.error("Error verificando rol:", error)
      throw new DatabaseError("Error al verificar rol")
    }
  }

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

      await this.checkEmailAndUsername(userData.email, userData.username)
      await this.checkRoleExists(userData.role)

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
      switch (role) {
        case RoleType.ADMIN:
        case RoleType.ADMINISTRATIVO:
          await client.query(
            "INSERT INTO administrativos (persona_id, cargo) VALUES ($1, 'gestor')",
            [personaId],
          )
          break

        case RoleType.PROFESOR:
          await client.query(
            "INSERT INTO profesores (persona_id) VALUES ($1)",
            [personaId],
          )
          break

        case RoleType.ESTUDIANTE:
          // El registro de estudiante se gestiona mediante el flujo de matrícula
          break

        default:
          throw new Error(`Rol '${role}' no tiene una tabla específica asociada`)
      }
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
          COALESCE(ARRAY_REMOVE(ARRAY_AGG(r.nombre), NULL),  ARRAY[]::enum_roles_nombre[]) as roles
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

      user.roles = parsePostgresArray(user.roles)

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

  // Crear usuario sin persona (para casos especiales, como administradores del sistema)
  /*
  la funcion creareUser metodo para crear un usurio usando el ID de una personsa ya existente
  se le puede pasar un cleint para usarlo dentro de una transaccion, para la creacion de usuario y persona en una trnsacion
  */
  async createUser(user: UsuarioCreationAttributes, personaID: number, role: RoleType, client?: any) {

    try {
      if (client === undefined) {
        await this.personaExisting(personaID)
      }

      // Validaciones previas a la creacion de usuario, chekeo de email, username y rol
      await this.checkEmailAndUsername(user.email, user.username)
      const roleId = await this.checkRoleExists(role)

      // Hash de contraseña
      const hashedPassword = await bcrypt.hash(user.contraseña, 12)

      // Creacion de usuario
      const usuarioResult = await UserRepository.create({ ...user, contraseña: hashedPassword }, client)

      // Si usuario se creo, entonces se le asigna un rol (si no se creo, no se asigna rol y se devuelve error)
      // En este punto, si no se creo el usuario y se le intenta dar un rol, se lanzara un error pero esto ya seria un error de estructura
      // Nota: arreglar la manera de client, si se pasa client, se asume que ya se hizo validacion de persona
      if (usuarioResult) {
        await UserRepository.assignRole(usuarioResult.usuario_id, roleId, client)
      }

      return {
        message: "Usuario creado exitosamente",
        data: {
          userId: usuarioResult.usuario_id,
          personaId: usuarioResult.persona_id,
          role: role
        },
      }
    } catch (error: any) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error
      }
      console.error("Error creando usuario:", error)
      throw new DatabaseError("Error al crear usuario")
    }
  }

  // Crear usuario con persona en una sola transacción
  async createUserWithPersona(user: UsuarioCreationAttributes, persona: PersonaCreationAttributes, role: RoleType) {
    try {

      // se inicia una transaccion para crear la persona y usuario mas al rol
      const result = await transaction(async (client) => {
        const existingPersona = await PersonaRepository.findByDocumento(persona.numero_documento, client)

        if (existingPersona.rows.length > 0) {
          throw new ConflictError("Ya existe una persona con ese documento")
        }

        const personaResult = await PersonaRepository.create(persona, client)
        const usuarioResult = await this.createUser(user, personaResult.persona_id, role, client)

        return {
          usuario: usuarioResult,
        }
      })

      return {
        message: "Usuario con persona creado exitosamente",
        data: result.usuario,
      }
    } catch (error: any) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error
      }
      console.error("Error creando usuario con persona:", error)
      throw new DatabaseError("Error al crear usuario con persona")
    }
  }

  // Restablecer contraseña al número de documento (para casos de olvido de contraseña)
  async resetPasswordByDefaultDocument(personaId: number){
    try {
      const persona = await PersonaRepository.findById(personaId)
      if (!persona) {
        throw new NotFoundError("Persona no encontrada")
      }

      const defaultPassword = persona.numero_documento
      const hashedPassword = await bcrypt.hash(defaultPassword, 12)

      const result = await query("UPDATE usuarios SET contraseña = $1 WHERE persona_id = $2 RETURNING *", [hashedPassword, personaId])

      if (result.rows.length === 0) {
        throw new NotFoundError("Usuario asociado a la persona no encontrado")
      }

      return { message: "Contraseña restablecida al número de documento exitosamente" }
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error
      }
      console.error("Error al restablecer contraseña:", error)
      throw new DatabaseError("Error al restablecer contraseña")
    }
  }
}
