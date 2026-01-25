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
exports.EstudianteRepository = void 0;
const database_1 = require("../../config/database");
class EstudianteRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT e.*, p.nombres, p.apellido_paterno, p.apellido_materno,td.tipo_documento, p.numero_documento, p.fecha_nacimiento
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY e.estudiante_id LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT e.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento, p.numero_documento, p.fecha_nacimiento
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE e.estudiante_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByPersonaId(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM estudiantes WHERE persona_id = $1", [personaId]);
            return result.rows[0];
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO estudiantes (persona_id, sede_id, jornada_id, fecha_ingreso, estado)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [data.persona_id, data.sede_id, data.jornada_id, data.fecha_ingreso || new Date(), data.estado || "activo"], client);
            return result.rows[0];
        });
    }
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "estudiante_id" && key !== "fecha_ingreso" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE estudiantes SET ${fields.join(", ")} WHERE estudiante_id = $${paramCount} RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    static findByDocumento(numero_documento) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT e.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento, p.numero_documento, p.fecha_nacimiento
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE p.numero_documento ILIKE '%' || $1 || '%'`, [numero_documento]);
            return result.rows[0];
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM estudiantes WHERE estudiante_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM estudiantes");
            return Number.parseInt(result.rows[0].count);
        });
    }
}
exports.EstudianteRepository = EstudianteRepository;
//# sourceMappingURL=EstudianteRepository.js.map