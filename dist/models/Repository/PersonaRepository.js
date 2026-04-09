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
exports.PersonaRepository = void 0;
const database_1 = require("../../config/database");
const personasql_1 = require("../shared/personasql");
class PersonaRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT 
        ${personasql_1.PERSONA_FIELDS_JSON}
      FROM personas p INNER JOIN tipo_documento td
     ON p.tipo_documento_id = td.tipo_documento_id
      ORDER BY persona_id LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT 
     ${personasql_1.PERSONA_FIELDS_JSON}
      FROM personas p INNER JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id WHERE persona_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByDocumento(numero_documento, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT 
      ${personasql_1.PERSONA_FIELDS_JSON}
      FROM personas p INNER JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id WHERE numero_documento = $1`, [numero_documento], client);
            return result.rows[0];
        });
    }
    static existingPersonaByDocumento(numero_documento, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT * FROM personas WHERE numero_documento = $1`, [numero_documento], client);
            return result.rows[0];
        });
    }
    static searchByDocumento(numero_documento) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT 
     ${personasql_1.PERSONA_FIELDS_JSON}
      FROM personas WHERE numero_documento ILIKE '%' || $1 || '%'`, [numero_documento]);
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
       FROM personas p INNER JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id, input
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
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO personas (
      nombres,
      apellido_paterno,
      apellido_materno,
      tipo_documento_id,
      numero_documento,
      grupo_sanguineo,
      fecha_nacimiento,
      genero,
      grupo_etnico,
      credo_religioso,
      lugar_nacimiento,
      serial_registro_civil,
      expedida_en
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`, [
                data.nombres,
                data.apellido_paterno,
                data.apellido_materno,
                data.tipo_documento_id,
                data.numero_documento,
                data.grupo_sanguineo,
                data.fecha_nacimiento,
                data.genero,
                data.grupo_etnico,
                data.credo_religioso,
                data.lugar_nacimiento,
                data.serial_registro_civil,
                data.expedida_en
            ], client);
            return result.rows[0];
        });
    }
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "persona_id" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE personas SET ${fields.join(", ")} WHERE persona_id = $${paramCount} RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM personas WHERE persona_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM personas");
            return Number.parseInt(result.rows[0].count);
        });
    }
    static getOrCreatePersona(personaData, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const persona = yield PersonaRepository.findByDocumento(personaData.numero_documento);
            if (persona)
                return persona;
            return yield PersonaRepository.create(personaData, client);
        });
    }
    static tieneRol(personaId, rol) {
        return __awaiter(this, void 0, void 0, function* () {
            const queries = {
                estudiante: "SELECT 1 FROM estudiantes      WHERE persona_id = $1 LIMIT 1",
                profesor: "SELECT 1 FROM profesores        WHERE persona_id = $1 LIMIT 1",
                acudiente: "SELECT 1 FROM acudientes        WHERE persona_id = $1 LIMIT 1",
                administrativo: "SELECT 1 FROM administrativos   WHERE persona_id = $1 LIMIT 1",
            };
            const sql = queries[rol];
            if (!sql)
                return false;
            const result = yield (0, database_1.query)(sql, [personaId]);
            return result.rows.length > 0;
        });
    }
    // También útil: obtener TODOS los roles activos de una persona
    static getRoles(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT 'estudiante'     AS rol FROM estudiantes     WHERE persona_id = $1
     UNION ALL
     SELECT 'profesor'       AS rol FROM profesores       WHERE persona_id = $1
     UNION ALL
     SELECT 'acudiente'      AS rol FROM acudientes       WHERE persona_id = $1
     UNION ALL
     SELECT 'administrativo' AS rol FROM administrativos  WHERE persona_id = $1`, [personaId]);
            return result.rows.map((r) => r.rol);
        });
    }
    static personaPuedeSubirArchivo(personaId, tipoArchivoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT 1 FROM tipos_archivo ta
     WHERE ta.tipo_archivo_id = $1
     AND (
       ta.aplica_a IS NULL  -- aplica a todos
       OR EXISTS (SELECT 1 FROM estudiantes     WHERE persona_id = $2) AND 'estudiante'     = ANY(ta.aplica_a)
       OR EXISTS (SELECT 1 FROM profesores       WHERE persona_id = $2) AND 'profesor'       = ANY(ta.aplica_a)
       OR EXISTS (SELECT 1 FROM acudientes       WHERE persona_id = $2) AND 'acudiente'      = ANY(ta.aplica_a)
       OR EXISTS (SELECT 1 FROM administrativos  WHERE persona_id = $2) AND 'administrativo' = ANY(ta.aplica_a)
     )`, [tipoArchivoId, personaId]);
            return result.rows.length > 0;
        });
    }
}
exports.PersonaRepository = PersonaRepository;
//# sourceMappingURL=PersonaRepository.js.map