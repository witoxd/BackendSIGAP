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
const V_MATRICULA_FIELDS_SQL = (prefije_table) => {
    return `
${prefije_table}.matricula_id,
${prefije_table}.estudiante_id,
${prefije_table}.curso_id,
${prefije_table}.jornada_id,
${prefije_table}.periodo_id,
${prefije_table}.estado_actual,
${prefije_table}.fecha_matricula,
${prefije_table}.fecha_retiro,
${prefije_table}.motivo_retiro,
${prefije_table}.anio,
${prefije_table}.estado_actual
`;
};
const PREVIEWS_V_MATRICULA_FIELDS_SQL = (prefije_table) => {
    return `
${prefije_table}.matricula_id,
${prefije_table}.periodo_id,
${prefije_table}.estado_actual,
${prefije_table}.fecha_matricula,
${prefije_table}.fecha_retiro,
${prefije_table}.motivo_retiro,
${prefije_table}.anio,
${prefije_table}.estado_actual,
${prefije_table}.periodo_descripcion
`;
};
const V_MATRICULA_FIELDS_JSON = (prefije_table) => {
    return `
  SELECT json_build_object(
  'matricula_id', ${prefije_table}.matricula_id,
  'estudiante_id', ${prefije_table}.estudiante_id,
  'curso_id', ${prefije_table}.curso_id,
  'jornada_id', ${prefije_table}.jornada_id,
  'periodo_id', ${prefije_table}.periodo_id,
  'estado', ${prefije_table}.estado,
  'fecha_matricula', ${prefije_table}.fecha_matricula,
  'fecha_retiro', ${prefije_table}.fecha_retiro,
  'motivo_retiro', ${prefije_table}.motivo_retiro,
  'anio', ${prefije_table}.anio,
  'estado_actual', ${prefije_table}.estado_actual
  ) AS V_Matricula`;
};
class MatriculaRepository {
    // ----------------------------------------------------------
    // findAll — ahora usa la vista para traer estado_actual
    // Reemplazar el findAll existente por este
    // ----------------------------------------------------------
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT
       ${PREVIEWS_V_MATRICULA_FIELDS_SQL("vm")},
       p.nombres,
       p.apellido_paterno,
       p.apellido_materno,
       c.nombre AS curso_nombre,
       c.grado
     FROM v_matriculas vm
     INNER JOIN estudiantes e ON vm.estudiante_id = e.estudiante_id
     INNER JOIN personas p    ON e.persona_id     = p.persona_id
     INNER JOIN cursos c      ON vm.curso_id      = c.curso_id
     ORDER BY vm.anio DESC, vm.fecha_matricula DESC
     LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    // ----------------------------------------------------------
    // findById — ahora incluye estado_actual de la vista
    // Reemplazar el findById existente por este
    // ----------------------------------------------------------
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`SELECT
       vm.*,
       p.nombres,
       p.apellido_paterno,
       p.apellido_materno,
       c.nombre AS curso_nombre,
       c.grado
     FROM v_matriculas vm
     INNER JOIN estudiantes e ON vm.estudiante_id = e.estudiante_id
     INNER JOIN personas p    ON e.persona_id     = p.persona_id
     INNER JOIN cursos c      ON vm.curso_id      = c.curso_id
     WHERE vm.matricula_id = $1`, [id]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    // ----------------------------------------------------------
    // findByEstudianteAndPeriodo — reemplaza findByEstudianteAndCurso
    // La validación ahora es por período, no por año libre
    // ----------------------------------------------------------
    static findByEstudianteAndPeriodo(estudianteId, periodoId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`SELECT * FROM matriculas
     WHERE estudiante_id = $1 AND periodo_id = $2`, [estudianteId, periodoId]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    // ----------------------------------------------------------
    // findByEstudiante — historial completo con estado calculado
    // ----------------------------------------------------------
    static findByEstudiante(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT
       vm.*,
       c.nombre AS curso_nombre,
       c.grado
     FROM v_matriculas vm
     INNER JOIN cursos c ON vm.curso_id = c.curso_id
     WHERE vm.estudiante_id = $1
     ORDER BY vm.anio DESC, vm.fecha_matricula DESC`, [estudianteId]);
            return result.rows;
        });
    }
    // ----------------------------------------------------------
    // create — ya NO necesita anio_egreso (viene del período)
    // El trigger fn_verificar_periodo_activo valida en BD
    // que el período exista, esté activo y dentro de fechas
    // ----------------------------------------------------------
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO matriculas
       (estudiante_id, curso_id, jornada_id, periodo_id, estado)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`, [
                data.estudiante_id,
                data.curso_id,
                data.jornada_id,
                data.periodo_id,
                "vigente", // Solo dos estados en BD: 'vigente' o 'retirada'
            ], client);
            return result.rows[0];
        });
    }
    // ----------------------------------------------------------
    // retirar — único cambio de estado manual permitido
    // Los demás estados se derivan de las fechas automáticamente
    // ----------------------------------------------------------
    static retirar(id, motivo, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`UPDATE matriculas
     SET
       estado        = 'retirada',
       fecha_retiro  = CURRENT_DATE,
       motivo_retiro = $2
     WHERE matricula_id = $1
     RETURNING *`, [id, motivo !== null && motivo !== void 0 ? motivo : null], client);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    // ----------------------------------------------------------
    // findActivas — matrículas activas del período actual
    // Usa la vista — estado_actual = 'activa' significa que
    // el período está activo Y dentro de fechas
    // ----------------------------------------------------------
    static findActivas() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT
       vm.*,
       p.nombres,
       p.apellido_paterno,
       c.nombre AS curso_nombre
     FROM v_matriculas vm
     INNER JOIN estudiantes e ON vm.estudiante_id = e.estudiante_id
     INNER JOIN personas p    ON e.persona_id     = p.persona_id
     INNER JOIN cursos c      ON vm.curso_id      = c.curso_id
     WHERE vm.estado_actual = 'activa'
     ORDER BY p.apellido_paterno, p.nombres
     LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    findAll() {
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