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
exports.ProfesorRepository = void 0;
const database_1 = require("../../config/database");
const personasql_1 = require("../shared/personasql");
const PROFESOR_FIELDS_JSON = `
        json_build_object(
          'profesor_id', pr.profesor_id,
          'fecha_contratacion', pr.fecha_contratacion,
          'estado', pr.estado
        ) AS profesor
`;
class ProfesorRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT
      ${personasql_1.PERSONA_FIELDS_JSON},
      ${PROFESOR_FIELDS_JSON}
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY pr.profesor_id LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT
       ${personasql_1.PERSONA_FIELDS_JSON},
       ${PROFESOR_FIELDS_JSON}
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE pr.profesor_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByPersonaId(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT
       ${personasql_1.PERSONA_FIELDS_JSON},
       ${PROFESOR_FIELDS_JSON}
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE pr.persona_id = $1`, [personaId]);
            return result.rows[0];
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO profesores (persona_id, fecha_contratacion, estado)
       VALUES ($1, $2, $3) RETURNING *`, [data.persona_id, data.fecha_contratacion || new Date(), data.estado || "activo"], client);
            return result.rows[0];
        });
    }
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "profesor_id" && key !== "fecha_contratacion" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE profesores SET ${fields.join(", ")} WHERE profesor_id = $${paramCount} RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    static SearchIndex(index_1) {
        return __awaiter(this, arguments, void 0, function* (index, limit = 50) {
            const normalizedIndex = index.trim().replace(/\s+/g, " ");
            if (!normalizedIndex)
                return [];
            const isDocumento = /^\d+$/.test(normalizedIndex);
            const result = yield (0, database_1.query)(`WITH input AS (
         SELECT $1::text AS q, $2::boolean AS is_documento
       )
       SELECT
      ${personasql_1.PERSONA_FIELDS_JSON},
      ${PROFESOR_FIELDS_JSON},
         CASE
           WHEN input.is_documento THEN
             CASE WHEN p.numero_documento = input.q THEN 1 ELSE 0 END
           ELSE
             ts_rank_cd(
               to_tsvector('spanish',
                 coalesce(p.nombres, '') || ' ' ||
                 coalesce(p.apellido_paterno, '') || ' ' ||
                 coalesce(p.apellido_materno, '')
               ),
               plainto_tsquery('spanish', input.q)
             )
         END AS rank
       FROM profesores pr
       INNER JOIN personas p ON pr.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id,
       input
       WHERE (
         input.is_documento = true
         AND p.numero_documento ILIKE '%' || input.q || '%'
       ) OR (
         input.is_documento = false
         AND (
           to_tsvector('spanish',
             coalesce(p.nombres, '') || ' ' ||
             coalesce(p.apellido_paterno, '') || ' ' ||
             coalesce(p.apellido_materno, '')
           ) @@ plainto_tsquery('spanish', input.q)
           OR (
             char_length(input.q) < 4 AND (
               p.nombres ILIKE '%' || input.q || '%'
               OR p.apellido_paterno ILIKE '%' || input.q || '%'
               OR p.apellido_materno ILIKE '%' || input.q || '%'
             )
           )
         )
       )
       ORDER BY rank DESC, p.apellido_paterno, p.apellido_materno, p.nombres
       LIMIT $3`, [normalizedIndex, isDocumento, limit]);
            return result.rows;
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM profesores WHERE profesor_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM profesores");
            return Number.parseInt(result.rows[0].count);
        });
    }
}
exports.ProfesorRepository = ProfesorRepository;
//# sourceMappingURL=ProfesorRepository.js.map