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
exports.MatriculaRepository = void 0;
const database_1 = require("../../config/database");
class MatriculaRepository {
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT m.*, 
              e.*,
              p.nombres, p.apellido_paterno,
              c.nombre as curso_nombre
       FROM matriculas m
       INNER JOIN estudiantes e ON m.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       INNER JOIN cursos c ON m.curso_id = c.curso_id
       ORDER BY m.fecha_matricula DESC LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT m.*, 
              e.*,
              p.nombres, p.apellido_paterno, p.apellido_materno,
              c.nombre as curso_nombre, c.grado
       FROM matriculas m
       INNER JOIN estudiantes e ON m.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       INNER JOIN cursos c ON m.curso_id = c.curso_id
       WHERE m.matricula_id = $1`, [id]);
            return result.rows[0];
        });
    }
    static findByEstudiante(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT m.*, c.nombre as curso_nombre, c.grado, c.seccion
       FROM matriculas m
       INNER JOIN cursos c ON m.curso_id = c.curso_id
       WHERE m.estudiante_id = $1
       ORDER BY m.anio_escolar DESC, m.fecha_matricula DESC`, [estudianteId]);
            return result.rows;
        });
    }
    static findByCurso(cursoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT m.*, 
              e.*,
              p.nombres, p.apellido_paterno, p.apellido_materno
       FROM matriculas m
       INNER JOIN estudiantes e ON m.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       WHERE m.curso_id = $1
       ORDER BY p.apellido_paterno, p.nombres`, [cursoId]);
            return result.rows;
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO matriculas (estudiante_id, curso_id, profesor_id, jornada_id, anio_egreso, estado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [data.estudiante_id, data.curso_id, data.profesor_id, data.jornada_id, data.anio_egreso, data.estado || "activa"], client);
            return result.rows[0];
        });
    }
    static findByEstudianteAndCurso(estudiante_id, curso_id, anio_egreso) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)("SELECT * FROM matriculas WHERE estudiante_id = $1 AND curso_id = $2 AND anio_egreso = $3", [estudiante_id, curso_id, anio_egreso]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    static findEstuidanteAndYear(estudiante_id, anio_egreso) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)("SELECT * FROM matriculas WHERE estudiante_id = $1 AND anio_egreso = $2", [estudiante_id, anio_egreso]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    static update(id, Data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(Data).forEach(([key, value]) => {
                if (key !== "matricula_id" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE matriculas SET ${fields.join(", ")} WHERE matricula_id = $${paramCount} RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM matriculas WHERE matricula_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM matriculas");
            return Number.parseInt(result.rows[0].count);
        });
    }
}
exports.MatriculaRepository = MatriculaRepository;
//# sourceMappingURL=MatriculaRepository.js.map