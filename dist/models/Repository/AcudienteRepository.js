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
exports.AcudienteRepository = void 0;
const database_1 = require("../../config/database");
class AcudienteRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT a.*, p.nombres, p.apellido_paterno, p.apellido_materno,  td.tipo_documento,
              p.numero_documento
       FROM acudientes a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY p.apellido_paterno, p.nombres LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT a.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento,
              p.numero_documento
       FROM acudientes a
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE a.acudiente_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByPersonaId(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM acudientes WHERE persona_id = $1", [personaId]);
            return result.rows[0];
        });
    }
    static findByEstudiante(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT a.*, p.nombres, p.apellido_paterno, p.apellido_materno, td.tipo_documento
              p.numero_documento,
              ae.tipo_relacion, ae.es_principal
       FROM acudientes a
       INNER JOIN acudiente_estudiante ae ON a.acudiente_id = ae.acudiente_id
       INNER JOIN personas p ON a.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE ae.estudiante_id = $1
       ORDER BY ae.es_principal DESC, p.apellido_paterno`, [estudianteId]);
            return result.rows;
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO acudientes (persona_id, parentesco)
       VALUES ($1, $2) RETURNING *`, [data.persona_id, data.parentesco], client);
            return result.rows[0];
        });
    }
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "acudiente_id" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE acudientes SET ${fields.join(", ")} WHERE acudiente_id = $${paramCount} RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM acudientes WHERE acudiente_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
    static assignToEstudiante(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO acudiente_estudiante (estudiante_id, acudiente_id, tipo_relacion, es_principal)
       VALUES ($1, $2, $3, $4) RETURNING *`, [data.estudiante_id, data.acudiente_id, data.tipo_relacion, data.es_principal]);
            return result.rows[0];
        });
    }
    static removeFromEstudiante(estudianteId, acudienteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM acudiente_estudiante WHERE estudiante_id = $1 AND acudiente_id = $2 RETURNING *", [estudianteId, acudienteId]);
            return result.rows[0];
        });
    }
}
exports.AcudienteRepository = AcudienteRepository;
//# sourceMappingURL=AcudienteRepository.js.map