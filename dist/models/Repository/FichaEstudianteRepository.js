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
exports.FichaEstudianteRepository = void 0;
const database_1 = require("../../config/database");
class FichaEstudianteRepository {
    static findByEstudianteId(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`SELECT
    ficha_id,
    estudiante_id,
    motivo_traslado,
    limitaciones_fisicas,
    otras_limitaciones,
    talentos_especiales,
    otras_actividades,
    numero_hermanos,
    posicion_hermanos,
    nombre_hermano_mayor,
    parientes_hogar,
    total_parientes,
    eps_ars,
    alergia,
    centro_atencion_medica,
    medio_transporte,
    transporte_propio,
    observaciones
       FROM ficha_estudiante f WHERE f.estudiante_id = $1`, [estudianteId]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    // ----------------------------------------------------------
    // UPSERT — el método principal de escritura de esta tabla
    //
    // ¿Por qué upsert y no create + update separados?
    // Porque la ficha se llena gradualmente en varias sesiones.
    // El frontend no necesita saber si ya existe o no — siempre
    // manda los datos y el repositorio resuelve si crear o actualizar.
    //
    //
    // ON CONFLICT (estudiante_id) DO UPDATE:
    //   Si ya existe una fila con ese estudiante_id → actualiza
    //   Si no existe → inserta
    // ----------------------------------------------------------
    static upsert(estudianteId, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = Object.keys(data).filter((k) => data[k] !== undefined);
            if (fields.length === 0)
                return null;
            const values = fields.map((f) => data[f]);
            // Construimos dinámicamente:
            // INSERT INTO ficha_estudiante (estudiante_id, campo1, campo2, ...)
            // VALUES ($1, $2, $3, ...)
            // ON CONFLICT (estudiante_id)
            // DO UPDATE SET campo1 = $2, campo2 = $3, ..., updated_at = NOW()
            const insertColumns = ["estudiante_id", ...fields].join(", ");
            const insertPlaceholders = ["$1", ...fields.map((_, i) => `$${i + 2}`)].join(", ");
            const updateClause = fields
                .map((f, i) => `${f} = $${i + 2}`)
                .join(", ");
            const result = yield (0, database_1.query)(`INSERT INTO ficha_estudiante (${insertColumns})
       VALUES (${insertPlaceholders})
       ON CONFLICT (estudiante_id)
       DO UPDATE SET ${updateClause}, updated_at = NOW()
       RETURNING *`, [estudianteId, ...values], client);
            return result.rows[0];
        });
    }
    // ----------------------------------------------------------
    // delete — eliminar ficha (caso borde: corrección de datos)
    // En cascada desde estudiantes, pero útil para limpiar
    // ----------------------------------------------------------
    static delete(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)("DELETE FROM ficha_estudiante WHERE estudiante_id = $1 RETURNING *", [estudianteId]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
}
exports.FichaEstudianteRepository = FichaEstudianteRepository;
//# sourceMappingURL=FichaEstudianteRepository.js.map