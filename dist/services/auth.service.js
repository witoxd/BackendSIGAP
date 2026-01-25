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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const AppError_1 = require("../utils/AppError");
class AuthService {
    // Registrar un nuevo usuario
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verificar si el email ya existe
                const emailCheck = yield (0, database_1.query)("SELECT usuario_id FROM usuarios WHERE email = $1", [userData.email]);
                if (emailCheck.rows.length > 0) {
                    throw new AppError_1.ConflictError("El email ya está registrado");
                }
                // Verificar si el username ya existe
                const usernameCheck = yield (0, database_1.query)("SELECT usuario_id FROM usuarios WHERE username = $1", [userData.username]);
                if (usernameCheck.rows.length > 0) {
                    throw new AppError_1.ConflictError("El username ya está en uso");
                }
                // Hash de la contraseña
                const hashedPassword = yield bcryptjs_1.default.hash(userData.contraseña, 12);
                // Usar transacción para crear persona, usuario y asignar rol
                const result = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                    // 1. Crear persona
                    const personaResult = yield client.query(`INSERT INTO personas (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,  fecha_nacimiento, genero)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING persona_id`, [
                        userData.nombres,
                        userData.apellido_paterno || null,
                        userData.apellido_materno || null,
                        userData.tipo_documento_id,
                        userData.numero_documento,
                        userData.fecha_nacimiento,
                        userData.genero || null,
                    ]);
                    const personaId = personaResult.rows[0].persona_id;
                    // 3. Crear usuario
                    const usuarioResult = yield client.query(`INSERT INTO usuarios (persona_id, username, contraseña, email, activo)
           VALUES ($1, $2, $3, $4, true)
           RETURNING usuario_id, email, username, fecha_creacion`, [personaId, userData.username, hashedPassword, userData.email]);
                    const usuario = usuarioResult.rows[0];
                    // 4. Obtener rol
                    const roleResult = yield client.query("SELECT role_id FROM roles WHERE nombre = $1", [userData.role]);
                    if (roleResult.rows.length === 0) {
                        throw new AppError_1.NotFoundError(`Rol '${userData.role}' no encontrado`);
                    }
                    const roleId = roleResult.rows[0].role_id;
                    // 5. Asignar rol al usuario
                    yield client.query("INSERT INTO usuarios_role (usuario_id, role_id) VALUES ($1, $2)", [
                        usuario.usuario_id,
                        roleId,
                    ]);
                    // 6. Crear registro específico según el rol
                    yield this.createRoleSpecificRecord(client, personaId, userData.role);
                    return {
                        userId: usuario.usuario_id,
                        personaId,
                        email: usuario.email,
                        username: usuario.username,
                        role: userData.role,
                    };
                }));
                return result;
            }
            catch (error) {
                if (error instanceof AppError_1.ConflictError || error instanceof AppError_1.NotFoundError) {
                    throw error;
                }
                console.error("Error en registro:", error);
                throw new AppError_1.DatabaseError("Error al registrar usuario");
            }
        });
    }
    // Crear registro específico según el rol
    createRoleSpecificRecord(client, personaId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!role) {
                throw new Error("El rol es requerido");
            }
            try {
                yield client.query("INSERT INTO administrativos (persona_id, sede_id, cargo) VALUES ($1, 1, 'gestor')", [personaId]);
            }
            catch (error) {
                console.error("Error creando registro específico de rol:", error);
                throw error;
            }
        });
    }
    // Login
    login(email, contraseña) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Buscar usuario con sus roles
                const result = yield (0, database_1.query)(`SELECT 
          u.usuario_id, u.persona_id, u.username, u.email, u.contraseña, u.activo,
          ARRAY_AGG(r.nombre) as roles
        FROM usuarios u
        LEFT JOIN usuarios_role ur ON u.usuario_id = ur.usuario_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE u.email = $1
        GROUP BY u.usuario_id`, [email]);
                if (result.rows.length === 0) {
                    throw new AppError_1.UnauthorizedError("Credenciales inválidas");
                }
                const user = result.rows[0];
                // Verificar si el usuario está activo
                if (!user.activo) {
                    throw new AppError_1.UnauthorizedError("Usuario inactivo. Contacte al administrador.");
                }
                // Verificar contraseña
                const isPasswordValid = yield bcryptjs_1.default.compare(contraseña, user.contraseña);
                if (!isPasswordValid) {
                    throw new AppError_1.UnauthorizedError("Credenciales inválidas");
                }
                // Generar token JWT
                const token = this.generateToken({
                    userId: user.usuario_id,
                    personaId: user.persona_id,
                    email: user.email,
                    roles: user.roles || [],
                });
                return {
                    token,
                    user: {
                        id: user.usuario_id,
                        personaId: user.persona_id,
                        username: user.username,
                        email: user.email,
                        roles: user.roles || [],
                    },
                };
            }
            catch (error) {
                if (error instanceof AppError_1.UnauthorizedError) {
                    throw error;
                }
                console.error("Error en login:", error);
                throw new AppError_1.DatabaseError("Error al iniciar sesión");
            }
        });
    }
    // Generar token JWT
    generateToken(payload) {
        var _a;
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET no configurado");
        }
        const expiresIn = (_a = process.env.JWT_EXPIRES_IN) !== null && _a !== void 0 ? _a : "7d";
        return jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn,
        });
    }
    // Cambiar contraseña
    changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener contraseña actual
                const result = yield (0, database_1.query)("SELECT contraseña FROM usuarios WHERE usuario_id = $1", [userId]);
                if (result.rows.length === 0) {
                    throw new AppError_1.NotFoundError("Usuario no encontrado");
                }
                const user = result.rows[0];
                // Verificar contraseña actual
                const isPasswordValid = yield bcryptjs_1.default.compare(currentPassword, user.contraseña);
                if (!isPasswordValid) {
                    throw new AppError_1.UnauthorizedError("Contraseña actual incorrecta");
                }
                // Hash de la nueva contraseña
                const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 12);
                // Actualizar contraseña
                yield (0, database_1.query)("UPDATE usuarios SET contraseña = $1 WHERE usuario_id = $2", [hashedPassword, userId]);
                return { message: "Contraseña actualizada exitosamente" };
            }
            catch (error) {
                if (error instanceof AppError_1.NotFoundError || error instanceof AppError_1.UnauthorizedError) {
                    throw error;
                }
                console.error("Error al cambiar contraseña:", error);
                throw new AppError_1.DatabaseError("Error al cambiar contraseña");
            }
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map