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
exports.ArchivoRepository = void 0;
const database_1 = require("../../config/database");
class ArchivoRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT a.*
       FROM archivos a
       LEFT JOIN personas p ON a.persona_id = p.persona_id
       ORDER BY a.fecha_carga DESC LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT a.*
       FROM archivos a
       LEFT JOIN personas p ON a.persona_id = p.persona_id
       WHERE a.archivo_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByPersonaId(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT * FROM archivos WHERE persona_id = $1
       ORDER BY fecha_carga DESC`, [personaId]);
            return result.rows;
        });
    }
    static findByTipo(tipoarchivos_1) {
        return __awaiter(this, arguments, void 0, function* (tipoarchivos, limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT a.* 
       FROM archivos a
       LEFT JOIN personas p ON a.persona_id = p.persona_id
       WHERE a.tipo_archivo = $1
       ORDER BY a.fecha_carga DESC LIMIT $2 OFFSET $3`, [tipoarchivos, limit, offset]);
            return result.rows;
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO archivos (persona_id, tipo_archivo, nombre, url_archivo, descripcion, asignado_por, fecha_carga, activo)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), true) RETURNING *`, [data.persona_id, data.tipo_archivo, data.nombre, data.url_archivo, data.descripcion, data.asignado_por], client);
            return result.rows[0];
        });
    }
    static bulkCreate(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.length === 0)
                return [];
            const fields = [
                "persona_id",
                "nombre",
                "descripcion",
                "tipo_archivo",
                "url_archivo",
                "asignado_por"
            ];
            const values = [];
            const placeholders = [];
            data.forEach((item, index) => {
                const baseIndex = index * fields.length;
                placeholders.push(`(${fields.map((_, i) => `$${baseIndex + i + 1}`).join(", ")})`);
                values.push(item.persona_id, item.nombre, item.descripcion, item.tipo_archivo, item.url_archivo, item.asignado_por);
            });
            const result = yield (0, database_1.query)(`
      INSERT INTO archivos (${fields.join(", ")})
      VALUES ${placeholders.join(", ")}
      RETURNING *`, values, client);
            return result;
        });
    }
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "archivo_id" && key !== "fecha_carga" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE archivos SET ${fields.join(", ")} WHERE archivo_id = $${paramCount} RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM archivos WHERE archivo_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM archivos");
            return Number.parseInt(result.rows[0].count);
        });
    }
    static countByPersona(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM archivos WHERE persona_id = $1", [personaId]);
            return Number.parseInt(result.rows[0].count);
        });
    }
}
exports.ArchivoRepository = ArchivoRepository;
//# sourceMappingURL=ArchivoRepository.js.map