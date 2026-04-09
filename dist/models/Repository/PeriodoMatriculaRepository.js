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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodoMatriculaRepository = void 0;
const database_1 = require("../../config/database");
class PeriodoMatriculaRepository {
    // ----------------------------------------------------------
    // findActivo — el método más importante de este repositorio.
    //
    // El backend llama esto cada vez que alguien intenta crear
    // una matrícula. Si no hay período activo, se lanza un error
    // antes de tocar cualquier otra tabla.
    //
    // El índice parcial en la BD garantiza que este query
    // devuelve 0 o 1 filas, nunca más.
    // ----------------------------------------------------------
    static findActivo() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`SELECT * FROM periodos_matricula WHERE activo = true LIMIT 1`);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT * FROM periodos_matricula ORDER BY anio DESC, fecha_inicio DESC`);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`SELECT * FROM periodos_matricula WHERE periodo_id = $1`, [id]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    static findByAnio(anio) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT * FROM periodos_matricula WHERE anio = $1`, [anio]);
            return result.rows;
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const result = yield (0, database_1.query)(`INSERT INTO periodos_matricula
         (anio, fecha_inicio, fecha_fin, activo, descripcion, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
                data.anio,
                data.fecha_inicio,
                data.fecha_fin,
                (_a = data.activo) !== null && _a !== void 0 ? _a : false,
                (_b = data.descripcion) !== null && _b !== void 0 ? _b : null,
                (_c = data.created_by) !== null && _c !== void 0 ? _c : null,
            ], client);
            return result.rows[0];
        });
    }
    // ----------------------------------------------------------
    // activar — habilita un período y desactiva cualquier otro.
    //
    // Aunque el índice parcial ya rechaza dos activos simultáneos
    // a nivel de BD, hacemos el UPDATE en dos pasos dentro de una
    // transacción para dar un mensaje de error claro al usuario
    // en lugar de un error de constraint crudo de PostgreSQL.
    // ----------------------------------------------------------
    static activar(id, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Primero desactivar cualquier período activo existente
            yield (0, database_1.query)(`UPDATE periodos_matricula SET activo = false WHERE activo = true`, [], client);
            // Luego activar el período solicitado
            const result = yield (0, database_1.query)(`UPDATE periodos_matricula
       SET activo = true
       WHERE periodo_id = $1
       RETURNING *`, [id], client);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    // ----------------------------------------------------------
    // desactivar — cierra el proceso de matrícula.
    // Ninguna matrícula nueva se podrá crear hasta que el admin
    // active otro período.
    // ----------------------------------------------------------
    static desactivar(id, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`UPDATE periodos_matricula
       SET activo = false
       WHERE periodo_id = $1
       RETURNING *`, [id], client);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // No se puede actualizar `activo` directamente — usar activar/desactivar
            const _b = data, { activo: _activo } = _b, safeData = __rest(_b, ["activo"]);
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(safeData).forEach(([key, value]) => {
                if (value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE periodos_matricula
       SET ${fields.join(", ")}
       WHERE periodo_id = $${paramCount}
       RETURNING *`, values, client);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Solo se puede eliminar si no tiene matrículas asociadas
            const result = yield (0, database_1.query)(`DELETE FROM periodos_matricula
       WHERE periodo_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM matriculas WHERE periodo_id = $1
         )
       RETURNING *`, [id]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT COUNT(*) FROM periodos_matricula`);
            return Number.parseInt(result.rows[0].count);
        });
    }
    // ----------------------------------------------------------
    // tieneMatriculas — útil antes de intentar eliminar
    // ----------------------------------------------------------
    static tieneMatriculas(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT EXISTS(
         SELECT 1 FROM matriculas WHERE periodo_id = $1
       ) AS tiene`, [id]);
            return result.rows[0].tiene;
        });
    }
}
exports.PeriodoMatriculaRepository = PeriodoMatriculaRepository;
//# sourceMappingURL=PeriodoMatriculaRepository.js.map