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
exports.UserRepository = void 0;
const database_1 = require("../../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT u.*, p.nombres, p.apellido_paterno, p.apellido_materno 
       FROM usuarios u 
       LEFT JOIN personas p ON u.persona_id = p.persona_id 
       ORDER BY u.usuario_id LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT u.*, p.nombres, p.apellido_paterno, p.apellido_materno 
       FROM usuarios u 
       LEFT JOIN personas p ON u.persona_id = p.persona_id 
       WHERE u.usuario_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT u.*, p.nombres, p.apellido_paterno, p.apellido_materno 
       FROM usuarios u 
       LEFT JOIN personas p ON u.persona_id = p.persona_id 
       WHERE u.email = $1`, [email]);
            return result.rows[0];
        });
    }
    static findByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM usuarios WHERE username = $1", [username]);
            return result.rows[0];
        });
    }
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(data.contraseña, 10);
            const result = yield (0, database_1.query)(`INSERT INTO usuarios (persona_id, username, email, contraseña, activo)
       VALUES ($1, $2, $3, $4, true) RETURNING *`, [data.persona_id, data.username, data.email, hashedPassword]);
            return result.rows[0];
        });
    }
    static updatePassword(id, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            const result = yield (0, database_1.query)("UPDATE usuarios SET contraseña = $1 WHERE usuario_id = $2 RETURNING *", [
                hashedPassword,
                id,
            ]);
            return result.rows[0];
        });
    }
    static toggleActive(id, activo) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("UPDATE usuarios SET activo = $1 WHERE usuario_id = $2 RETURNING *", [activo, id]);
            return result.rows[0];
        });
    }
    static verifyPassword(plainPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(plainPassword, hashedPassword);
        });
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
    static assignRole(userId, roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO usuarios_role (usuario_id, role_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`, [userId, roleId]);
            return result.rows[0];
        });
    }
    static removeRole(userId, roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM usuarios_role WHERE usuario_id = $1 AND role_id = $2 RETURNING *", [
                userId,
                roleId,
            ]);
            return result.rows[0];
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM usuarios");
            return Number.parseInt(result.rows[0].count);
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map