"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = require("../config/database");
const AppError_1 = require("../utils/AppError");
class UserService {
    // Obtener usuario por ID con información completa
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, database_1.query)(`SELECT 
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
        GROUP BY u.usuario_id, p.persona_id, td.tipo_documento`, [userId]);
                if (result.rows.length === 0) {
                    throw new AppError_1.NotFoundError("Usuario no encontrado");
                }
                const user = result.rows[0];
                // Excluir contraseña
                delete user.contraseña;
                return user;
            }
            catch (error) {
                if (error instanceof AppError_1.NotFoundError) {
                    throw error;
                }
                console.error("Error obteniendo usuario:", error);
                throw new AppError_1.DatabaseError("Error al obtener usuario");
            }
        });
    }
    // Buscar usuarios con paginación y filtros
    searchUsers(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query: searchQuery, nombres, numero_documento, role, pagination } = params;
                const { page, limit, sortBy = "usuario_id", sortOrder = "DESC" } = pagination;
                const offset = (page - 1) * limit;
                // Construir WHERE dinámicamente
                const conditions = [];
                const values = [];
                let paramCount = 1;
                if (searchQuery) {
                    conditions.push(`(
          p.nombres ILIKE $${paramCount} OR 
          p.apellido_paterno ILIKE $${paramCount} OR 
          p.apellido_materno ILIKE $${paramCount} OR
          p.numero_documento ILIKE $${paramCount}
        )`);
                    values.push(`%${searchQuery}%`);
                    paramCount++;
                }
                if (nombres) {
                    conditions.push(`p.nombres ILIKE $${paramCount}`);
                    values.push(`%${nombres}%`);
                    paramCount++;
                }
                if (numero_documento) {
                    conditions.push(`p.numero_documento = $${paramCount}`);
                    values.push(numero_documento);
                    paramCount++;
                }
                if (role) {
                    conditions.push(`r.nombre = $${paramCount}`);
                    values.push(role);
                    paramCount++;
                }
                const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
                // Query para contar total
                const countQuery = `
        SELECT COUNT(DISTINCT u.usuario_id) as total
        FROM usuarios u
        INNER JOIN personas p ON u.persona_id = p.persona_id
        LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
        LEFT JOIN usuarios_role ur ON u.usuario_id = ur.usuario_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        ${whereClause}
      `;
                const countResult = yield (0, database_1.query)(countQuery, values);
                const total = Number.parseInt(countResult.rows[0].total);
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
      `;
                const dataResult = yield (0, database_1.query)(dataQuery, [...values, limit, offset]);
                return {
                    data: dataResult.rows,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                };
            }
            catch (error) {
                console.error("Error buscando usuarios:", error);
                throw new AppError_1.DatabaseError("Error al buscar usuarios");
            }
        });
    }
    // Asignar rol de administrador (solo admin puede hacerlo)
    assignAdminRole(targetUserId, adminUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verificar que el usuario actual es admin
                const adminCheck = yield (0, database_1.query)(`SELECT EXISTS(
          SELECT 1 FROM usuarios_role ur
          INNER JOIN roles r ON ur.role_id = r.role_id
          WHERE ur.usuario_id = $1 AND r.nombre = 'admin'
        ) as is_admin`, [adminUserId]);
                if (!adminCheck.rows[0].is_admin) {
                    throw new AppError_1.ForbiddenError("Solo administradores pueden asignar roles de admin");
                }
                // Verificar que el usuario objetivo existe
                const userCheck = yield (0, database_1.query)("SELECT usuario_id FROM usuarios WHERE usuario_id = $1", [targetUserId]);
                if (userCheck.rows.length === 0) {
                    throw new AppError_1.NotFoundError("Usuario no encontrado");
                }
                // Obtener ID del rol administrador
                const roleResult = yield (0, database_1.query)("SELECT role_id FROM roles WHERE nombre = $1", ["admin"]);
                if (roleResult.rows.length === 0) {
                    throw new AppError_1.NotFoundError("Rol administrador no encontrado");
                }
                const adminRoleId = roleResult.rows[0].role_id;
                // Verificar si ya tiene el rol
                const hasRoleCheck = yield (0, database_1.query)("SELECT usuario_role_id FROM usuarios_role WHERE usuario_id = $1 AND role_id = $2", [targetUserId, adminRoleId]);
                if (hasRoleCheck.rows.length > 0) {
                    throw new AppError_1.ConflictError("El usuario ya tiene el rol de administrador");
                }
                // Asignar rol
                yield (0, database_1.query)("INSERT INTO usuarios_role (usuario_id, role_id) VALUES ($1, $2)", [targetUserId, adminRoleId]);
                // Registrar en auditoría
                yield (0, database_1.query)(`INSERT INTO auditoria (tabla_nombre, accion, usuario_id, detalle)
         VALUES ($1, $2, $3, $4)`, ["usuarios_role", "ASSIGN_ADMIN", adminUserId, JSON.stringify({ targetUserId, roleId: adminRoleId })]);
                return { message: "Rol de administrador asignado exitosamente" };
            }
            catch (error) {
                if (error instanceof AppError_1.NotFoundError || error instanceof AppError_1.ForbiddenError || error instanceof AppError_1.ConflictError) {
                    throw error;
                }
                console.error("Error asignando rol admin:", error);
                throw new AppError_1.DatabaseError("Error al asignar rol de administrador");
            }
        });
    }
    // Transferir rol de administrador (cambio de rector)
    transferAdminRole(fromUserId, toUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verificar que ambos usuarios existen
                const usersCheck = yield (0, database_1.query)("SELECT usuario_id FROM usuarios WHERE usuario_id IN ($1, $2)", [
                    fromUserId,
                    toUserId,
                ]);
                if (usersCheck.rows.length !== 2) {
                    throw new AppError_1.NotFoundError("Uno o ambos usuarios no encontrados");
                }
                // Obtener ID del rol administrador
                const roleResult = yield (0, database_1.query)("SELECT role_id FROM roles WHERE nombre = $1", ["admin"]);
                if (roleResult.rows.length === 0) {
                    throw new AppError_1.NotFoundError("Rol administrador no encontrado");
                }
                const adminRoleId = roleResult.rows[0].role_id;
                yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                    // Remover rol admin del usuario actual
                    yield client.query("DELETE FROM usuarios_role WHERE usuario_id = $1 AND role_id = $2", [fromUserId, adminRoleId]);
                    // Asignar rol admin al nuevo usuario (si no lo tiene)
                    yield client.query(`INSERT INTO usuarios_role (usuario_id, role_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`, [toUserId, adminRoleId]);
                    // Registrar en auditoría
                    yield client.query(`INSERT INTO auditoria (tabla_nombre, accion, usuario_id, detalle)
           VALUES ($1, $2, $3, $4)`, ["usuarios_role", "TRANSFER_ADMIN", fromUserId, JSON.stringify({ fromUserId, toUserId, roleId: adminRoleId })]);
                }));
                return { message: "Rol de administrador transferido exitosamente" };
            }
            catch (error) {
                if (error instanceof AppError_1.NotFoundError) {
                    throw error;
                }
                console.error("Error transfiriendo rol admin:", error);
                throw new AppError_1.DatabaseError("Error al transferir rol de administrador");
            }
        });
    }
    // Activar/desactivar usuario
    toggleUserStatus(userId, activo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, database_1.query)("UPDATE usuarios SET activo = $1 WHERE usuario_id = $2 RETURNING usuario_id", [
                    activo,
                    userId,
                ]);
                if (result.rows.length === 0) {
                    throw new AppError_1.NotFoundError("Usuario no encontrado");
                }
                return { message: `Usuario ${activo ? "activado" : "desactivado"} exitosamente` };
            }
            catch (error) {
                if (error instanceof AppError_1.NotFoundError) {
                    throw error;
                }
                console.error("Error actualizando estado de usuario:", error);
                throw new AppError_1.DatabaseError("Error al actualizar estado del usuario");
            }
        });
    }
    createUser() {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementación de creación de usuario (si es necesario)
        });
    }
    resetPasswordUser() {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementación de reseteo de contraseña (si es necesario)
        });
    }
    createUserWithPersona() {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementación de creación de usuario junto con persona (si es necesario)
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map