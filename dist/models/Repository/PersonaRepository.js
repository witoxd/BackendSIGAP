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
class PersonaRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)("SELECT * FROM personas ORDER BY persona_id LIMIT $1 OFFSET $2", [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM personas WHERE persona_id = $1", [id]);
            return result.rows[0];
        });
    }
    static findByDocumento(numero_documento) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM personas WHERE numero_documento = $1", [numero_documento]);
            return result.rows[0];
        });
    }
    static searchByDocumento(numero_documento) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM personas WHERE numero_documento ILIKE '%' || $1 || '%'", [numero_documento]);
            return result.rows[0];
        });
    }
    static SearchIndex(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const isDocumento = /^\d+$/.test(index);
            console.log("Es documento?: ", isDocumento);
            const result = yield (0, database_1.query)(`SELECT * FROM personas WHERE
       ( $2 = false AND to_tsvector
         (  'spanish', coalesce(nombres, '') || '
            ' || coalesce(apellido_paterno, '') || ' 
            ' || coalesce(apellido_materno, '') )
             @@ plainto_tsquery('spanish', $1))
              OR ($2 = true AND numero_documento ILIKE '%' || $1 || '%' )`, [index, isDocumento]);
            return result.rows;
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO personas (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento, fecha_nacimiento, genero)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [
                data.nombres,
                data.apellido_paterno,
                data.apellido_materno,
                data.tipo_documento_id,
                data.numero_documento,
                data.fecha_nacimiento,
                data.genero,
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
}
exports.PersonaRepository = PersonaRepository;
//# sourceMappingURL=PersonaRepository.js.map