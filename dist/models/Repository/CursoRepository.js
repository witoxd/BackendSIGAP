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
exports.CursoRepository = void 0;
const database_1 = require("../../config/database");
class CursoRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)("SELECT * FROM cursos ORDER BY grado DESC, grado ASC LIMIT $1 OFFSET $2", [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM cursos WHERE curso_id = $1", [id]);
            return result.rows[0];
        });
    }
    static findByGrado(grado) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM cursos WHERE grado = $1 ORDER BY grado DESC", [grado]);
            return result.rows[0];
        });
    }
    static findByAño(año) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM cursos WHERE año = $1 ORDER BY grado ASC", [año]);
            return result.rows;
        });
    }
    static findByProfesor(profesor_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM cursos WHERE profesor_id = $1 ORDER BY grado ASC", [profesor_id]);
            return result.rows;
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const rsult = yield (0, database_1.query)(`INSERT INTO cursos (nombre, grado)
       VALUES ($1, $2) RETURNING *`, [
                data.nombre,
                data.grado
            ], client);
            return rsult.rows[0];
        });
    }
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "curso_id" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE cursos SET ${fields.join(", ")} WHERE curso_id = $${paramCount} RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM cursos WHERE curso_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM cursos");
            return parseInt(result.rows[0].count, 10);
        });
    }
}
exports.CursoRepository = CursoRepository;
//# sourceMappingURL=CursoRepository.js.map