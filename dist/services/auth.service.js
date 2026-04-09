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
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const UserRepository_1 = require("../models/Repository/UserRepository");
class AuthService {
    // Registrar un nuevo usuario
    personaExisting(personaID) {
        return __awaiter(this, void 0, void 0, function* () {
            const run = (txClient) => __awaiter(this, void 0, void 0, function* () {
                const [personaResult] = yield Promise.all([
                    (0, database_1.query)("SELECT persona_id FROM personas WHERE persona_id = $1", [personaID], txClient),
                ]);
                if (personaResult.rows.length === 0) {
                    throw new AppError_1.NotFoundError(`Persona con ID '${personaID}' no encontrada`);
                }
                const existingUserByPersona = yield (0, database_1.query)("SELECT usuario_id FROM usuarios WHERE persona_id = $1", [personaID], txClient);
                if (existingUserByPersona.rows.length > 0) {
                    throw new AppError_1.ConflictError("La persona ya tiene un usuario asignado");
                }
            });
        });
    }
    checkEmailAndUsername(email, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const run = (txClient) => __awaiter(this, void 0, void 0, function* () {
                const [emailCheck, usernameCheck] = yield Promise.all([
                    (0, database_1.query)("SELECT usuario_id FROM usuarios WHERE email = $1", [email], txClient),
                    (0, database_1.query)("SELECT usuario_id FROM usuarios WHERE username = $1", [username], txClient),
                ]);
                if (emailCheck.rows.length > 0) {
                    throw new AppError_1.ConflictError("El email ya está registrado");
                }
                if (usernameCheck.rows.length > 0) {
                    throw new AppError_1.ConflictError("El username ya está en uso");
                }
            });
            try {
                yield (0, database_1.transaction)(run);
            }
            catch (error) {
                if (error instanceof AppError_1.ConflictError) {
                    throw error;
                }
                console.error("Error verificando email y username:", error);
                throw new AppError_1.DatabaseError("Error al verificar email y username");
            }
        });
    }
    checkRoleExists(roleName) {
        return __awaiter(this, void 0, void 0, function* () {
            const run = (txClient) => __awaiter(this, void 0, void 0, function* () {
                const roleResult = yield (0, database_1.query)("SELECT role_id FROM roles WHERE nombre = $1", [roleName], txClient);
                if (roleResult.rows.length === 0) {
                    throw new AppError_1.NotFoundError(`Rol '${roleName}' no encontrado`);
                }
                return roleResult.rows[0].role_id;
            });
            try {
                return yield (0, database_1.transaction)(run);
            }
            catch (error) {
                if (error instanceof AppError_1.NotFoundError) {
                    throw error;
                }
                console.error("Error verificando rol:", error);
                throw new AppError_1.DatabaseError("Error al verificar rol");
            }
        });
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.checkEmailAndUsername(userData.email, userData.username);
                const roleId = yield this.checkRoleExists(userData.role);
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
                yield client.query("INSERT INTO administrativos (persona_id, cargo) VALUES ($1, 'gestor')", [personaId]);
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
    // Crear usuario sin persona (para casos especiales, como administradores del sistema)
    /*
    la funcion creareUser metodo para crear un usurio usando el ID de una personsa ya existente
    se le puede pasar un cleint para usarlo dentro de una transaccion, para la creacion de usuario y persona en una trnsacion
    */
    createUser(user, personaID, role, client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (client === undefined) {
                    this.personaExisting(personaID);
                }
                // Validaciones previas a la creacion de usuario, chekeo de email, username y rol
                this.checkEmailAndUsername(user.email, user.username);
                const roleResult = yield this.checkRoleExists(role);
                // Hash de contraseña
                const hashedPassword = yield bcryptjs_1.default.hash(user.contraseña, 12);
                // Creacion de usuario
                const usuarioResult = yield UserRepository_1.UserRepository.create(Object.assign(Object.assign({}, user), { contraseña: hashedPassword }), client);
                const roleId = roleResult.rows[0].role_id;
                // Si usuario se creo, entonces se le asigna un rol (si no se creo, no se asigna rol y se devuelve error)
                // En este punto, si no se creo el usuario y se le intenta dar un rol, se lanzara un error pero esto ya seria un error de estructura
                // Nota: arreglar la manera de client, si se pasa client, se asume que ya se hizo validacion de persona
                if (usuarioResult) {
                    yield UserRepository_1.UserRepository.assignRole(usuarioResult.usuario_id, roleId, client);
                }
                return {
                    message: "Usuario creado exitosamente",
                    data: {
                        userId: usuarioResult.usuario_id,
                        personaId: usuarioResult.persona_id,
                        role: role
                    },
                };
            }
            catch (error) {
                if (error instanceof AppError_1.ConflictError || error instanceof AppError_1.NotFoundError) {
                    throw error;
                }
                console.error("Error creando usuario:", error);
                throw new AppError_1.DatabaseError("Error al crear usuario");
            }
        });
    }
    // Crear usuario con persona en una sola transacción
    createUserWithPersona(user, persona, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // se inicia una transaccion para crear la persona y usuario mas al rol
                const result = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                    const existingPersona = yield PersonaRepository_1.PersonaRepository.findByDocumento(persona.numero_documento, client);
                    if (existingPersona.rows.length > 0) {
                        throw new AppError_1.ConflictError("Ya existe una persona con ese documento");
                    }
                    const personaResult = yield PersonaRepository_1.PersonaRepository.create(persona, client);
                    const usuarioResult = yield this.createUser(user, personaResult.persona_id, role, client);
                    return {
                        usuario: usuarioResult,
                    };
                }));
                return {
                    message: "Usuario con persona creado exitosamente",
                    data: result.usuario,
                };
            }
            catch (error) {
                if (error instanceof AppError_1.ConflictError || error instanceof AppError_1.NotFoundError) {
                    throw error;
                }
                console.error("Error creando usuario con persona:", error);
                throw new AppError_1.DatabaseError("Error al crear usuario con persona");
            }
        });
    }
    // Restablecer contraseña al número de documento (para casos de olvido de contraseña)
    resetPasswordByDefaultDocument(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const persona = yield PersonaRepository_1.PersonaRepository.findById(personaId);
                if (!persona) {
                    throw new AppError_1.NotFoundError("Persona no encontrada");
                }
                const defaultPassword = persona.numero_documento;
                const hashedPassword = yield bcryptjs_1.default.hash(defaultPassword, 12);
                const result = yield (0, database_1.query)("UPDATE usuarios SET contraseña = $1 WHERE persona_id = $2 RETURNING *", [hashedPassword, personaId]);
                if (result.rows.length === 0) {
                    throw new AppError_1.NotFoundError("Usuario asociado a la persona no encontrado");
                }
                return { message: "Contraseña restablecida al número de documento exitosamente" };
            }
            catch (error) {
                if (error instanceof AppError_1.NotFoundError) {
                    throw error;
                }
                console.error("Error al restablecer contraseña:", error);
                throw new AppError_1.DatabaseError("Error al restablecer contraseña");
            }
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map