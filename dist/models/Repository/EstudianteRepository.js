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
const personasql_1 = require("../shared/personasql");
const ESTUDIANTE_FIELDS_JSON = `
       json_build_object(
         'estudiante_id', e.estudiante_id,
         'fecha_ingreso', e.fecha_ingreso,
         'estado', e.estado
       ) AS estudiante
        `;
class EstudianteRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT 
       ${personasql_1.PERSONA_FIELDS_JSON},
       ${ESTUDIANTE_FIELDS_JSON}
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       ORDER BY e.estudiante_id LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT
       ${personasql_1.PERSONA_FIELDS_JSON},
       ${ESTUDIANTE_FIELDS_JSON}
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE e.estudiante_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByPersonaId(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT
        json_build_object(
        'persona_id', e.persona_id,
        'nombres', p.nombres,
        'apellido_paterno', p.apellido_paterno,
        'apellido_materno', p.apellido_materno,
        'tipo_sangre', p.tipo_sangre,
        'fecha_nacimiento', p.fecha_nacimiento,
        'genero', p.genero,
        'numero_documento', p.numero_documento,
        'tipo_documento', json_build_object(
          'tipo_documento_id', td.tipo_documento_id,
          'tipo_documento', td.tipo_documento
        )
      ) AS persona,
       json_build_object(
         'estudiante_id', e.estudiante_id,
         'fecha_ingreso', e.fecha_ingreso,
         'estado', e.estado
       ) AS estudiante
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE e.persona_id = $1`, [personaId]);
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
       ${ESTUDIANTE_FIELDS_JSON},
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
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
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
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO estudiantes (persona_id, fecha_ingreso, estado)
       VALUES ($1, $2, $3) RETURNING *`, [data.persona_id, data.fecha_ingreso || new Date(), data.estado || "activo"], client);
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
            const result = yield (0, database_1.query)(`SELECT
       ${personasql_1.PERSONA_FIELDS_JSON},
       ${ESTUDIANTE_FIELDS_JSON}
       FROM estudiantes e
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE p.numero_documento ILIKE '%' || $1 || '%'`, [numero_documento]);
            return result.rows[0];
        });
    }
    //Obtener estudiantes asignados a un acudiente
    static getEstudiantesByAcudiente(acudienteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT
      json_build_object(
        'acudiente_estudiante_id', ae.acudiente_estudiante_id,
        'acudiente_id', ae.acudiente_id,
        'tipo_relacion', ae.tipo_relacion,
        'es_principal', ae.es_principal
    ) AS relacion,
        json_build_object(
        'persona_id', e.persona_id,
        'estudiante_id', e.estudiante_id,
        'nombres', p.nombres,
        'apellido_paterno', p.apellido_paterno,
        'apellido_materno', p.apellido_materno,
        'numero_documento', p.numero_documento
       ) AS estudiante
       FROM acudiente_estudiante ae
       INNER JOIN estudiantes e ON ae.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       LEFT JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
       WHERE ae.acudiente_id = $1
       ORDER BY p.apellido_paterno, p.apellido_materno, p.nombres`, [acudienteId]);
            return result.rows;
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