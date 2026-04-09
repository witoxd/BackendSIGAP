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
exports.ViviendaEstudianteRepository = void 0;
const database_1 = require("../../config/database");
class ViviendaEstudianteRepository {
    static findByEstudianteId(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)("SELECT * FROM vivienda_estudiante WHERE estudiante_id = $1", [estudianteId]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    // ----------------------------------------------------------
    // La vivienda también se llena gradualmente y es 1:1 con
    // el estudiante, así que ON CONFLICT (estudiante_id) es ideal.
    //
    // Diferencia con FichaEstudiante: aquí no hay JOIN con personas
    // porque los datos de vivienda son puramente socioeconómicos,
    // no tienen relación con campos de la tabla personas.
    // ----------------------------------------------------------
    static upsert(estudianteId, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = Object.keys(data).filter((k) => data[k] !== undefined);
            if (fields.length === 0)
                return null;
            const values = fields.map((f) => data[f]);
            const insertColumns = ["estudiante_id", ...fields].join(", ");
            const insertPlaceholders = ["$1", ...fields.map((_, i) => `$${i + 2}`)].join(", ");
            const updateClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
            const result = yield (0, database_1.query)(`INSERT INTO vivienda_estudiante (${insertColumns})
       VALUES (${insertPlaceholders})
       ON CONFLICT (estudiante_id)
       DO UPDATE SET ${updateClause}, updated_at = NOW()
       RETURNING *`, [estudianteId, ...values], client);
            return result.rows[0];
        });
    }
    static delete(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)("DELETE FROM vivienda_estudiante WHERE estudiante_id = $1 RETURNING *", [estudianteId]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
}
exports.ViviendaEstudianteRepository = ViviendaEstudianteRepository;
//# sourceMappingURL=ViviendaEstudianteRepository.js.map