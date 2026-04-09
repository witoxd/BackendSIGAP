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
exports.PermisoRepository = void 0;
const database_1 = require("../../config/database");
class PermisoRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 100, offset = 0) {
            const result = yield (0, database_1.query)("SELECT * FROM permisos ORDER BY recurso, accion LIMIT $1 OFFSET $2", [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM permisos WHERE permiso_id = $1", [id]);
            return result.rows[0];
        });
    }
    static findByRole(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT p.* FROM permisos p
       INNER JOIN role_permiso rp ON p.permiso_id = rp.permiso_id
       WHERE rp.role_id = $1
       ORDER BY p.recurso, p.accion`, [roleId]);
            return result.rows;
        });
    }
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO permisos (nombre, descripcion, recurso, accion)
       VALUES ($1, $2, $3, $4) RETURNING *`, [data.nombre, data.descripcion, data.recurso, data.accion]);
            return result.rows[0];
        });
    }
    static assignToRole(roleId, permisoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO role_permisos (role_id, permiso_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`, [roleId, permisoId]);
            return result.rows[0];
        });
    }
    static assingnRoleToUser(usuarioId, permisoId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO user_permisos (usuario_id, permiso_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`, [usuarioId, permisoId], client);
            return result.rows[0];
        });
    }
    static removeFromRole(roleId, permisoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`DELETE FROM role_permisos
       WHERE role_id = $1 AND permiso_id = $2 
       RETURNING *`, [roleId, permisoId]);
            return result.rows[0];
        });
    }
    static checkPermission(roleId, recurso, accion) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT EXISTS(
        SELECT 1 FROM role_permisos rp
        INNER JOIN permisos p ON rp.permiso_id = p.permiso_id
        WHERE rp.role_id = $1 AND p.recurso = $2 AND (p.accion = $3 OR p.accion = 'manage')
      ) as tiene_permiso`, [roleId, recurso, accion]);
            return result.rows[0].tiene_permiso;
        });
    }
}
exports.PermisoRepository = PermisoRepository;
//# sourceMappingURL=PermisoRepository.js.map