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
exports.EgresadoRepository = void 0;
const database_1 = require("../../config/database");
class EgresadoRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT eg.*, e.*, p.nombres, p.apellido_paterno, p.apellido_materno,
              p.numero_documento, td.tipo_documento
       FROM egresados eg
       INNER JOIN estudiantes e ON eg.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY eg.fecha_grado DESC LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT eg.*, e.*, p.nombres, p.apellido_paterno, p.apellido_materno,
              td.tipo_documento, p.numero_documento
       FROM egresados eg
       INNER JOIN estudiantes e ON eg.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE eg.egresado_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByEstudianteId(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM egresados WHERE estudiante_id = $1", [estudianteId]);
            return result.rows[0];
        });
    }
    static findByYear(year) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT eg.*, e.*, p.nombres, p.apellido_paterno, p.apellido_materno
       FROM egresados eg
       INNER JOIN estudiantes e ON eg.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       WHERE EXTRACT(YEAR FROM eg.fecha_grado) = $1
       ORDER BY eg.fecha_grado DESC`, [year]);
            return result.rows;
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO egresados (estudiante_id, fecha_grado)
       VALUES ($1, $2) RETURNING *`, [data.estudiante_id, data.fecha_grado || new Date()], client);
            return result.rows[0];
        });
    }
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "egresado_id" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE egresados SET ${fields.join(", ")} WHERE egresado_id = $${paramCount} RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM egresados WHERE egresado_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM egresados");
            return Number.parseInt(result.rows[0].count);
        });
    }
}
exports.EgresadoRepository = EgresadoRepository;
//# sourceMappingURL=EgresadoRepository.js.map