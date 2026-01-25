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
exports.AuditoriaRepository = void 0;
const database_1 = require("../../config/database");
class AuditoriaRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT a.*, u.username, p.nombres, p.apellido_paterno
       FROM auditoria a
       LEFT JOIN usuarios u ON a.usuario_id = u.usuario_id
       LEFT JOIN personas p ON u.persona_id = p.persona_id
       ORDER BY a.fecha_accion DESC LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT a.*, u.username, p.nombres, p.apellido_paterno
       FROM auditoria a
       LEFT JOIN usuarios u ON a.usuario_id = u.usuario_id
       LEFT JOIN personas p ON u.persona_id = p.persona_id
       WHERE a.auditoria_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByUsuarioId(usuarioId_1) {
        return __awaiter(this, arguments, void 0, function* (usuarioId, limit = 50, offset = 0) {
            const result = yield (0, database_1.query)("SELECT * FROM auditoria WHERE usuario_id = $1 ORDER BY fecha_accion DESC LIMIT $2 OFFSET $3", [usuarioId, limit, offset]);
            return result.rows;
        });
    }
    static findByAccion(accion_1) {
        return __awaiter(this, arguments, void 0, function* (accion, limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT a.*, u.username, p.nombres, p.apellido_paterno
       FROM auditoria a
       LEFT JOIN usuarios u ON a.usuario_id = u.usuario_id
       LEFT JOIN personas p ON u.persona_id = p.persona_id
       WHERE a.accion = $1
       ORDER BY a.fecha_accion DESC LIMIT $2 OFFSET $3`, [accion, limit, offset]);
            return result.rows;
        });
    }
    static findByTabla(tabla_1) {
        return __awaiter(this, arguments, void 0, function* (tabla, limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT a.*, u.username, p.nombres, p.apellido_paterno
       FROM auditoria a
       LEFT JOIN usuarios u ON a.usuario_id = u.usuario_id
       LEFT JOIN personas p ON u.persona_id = p.persona_id
       WHERE a.tabla = $1
       ORDER BY a.fecha_accion DESC LIMIT $2 OFFSET $3`, [tabla, limit, offset]);
            return result.rows;
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM auditoria");
            return Number.parseInt(result.rows[0].count);
        });
    }
    static countByUsuario(usuarioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM auditoria WHERE usuario_id = $1", [usuarioId]);
            return Number.parseInt(result.rows[0].count);
        });
    }
}
exports.AuditoriaRepository = AuditoriaRepository;
//# sourceMappingURL=AuditoriaRepository.js.map