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
exports.ColegioAnteriorRepository = void 0;
const database_1 = require("../../config/database");
class ColegioAnteriorRepository {
    static findByEstudianteId(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT 
      colegio_ant_id,
      estudiante_id,
      nombre_colegio,
      ciudad,
      grado_cursado,
      anio,
      orden
       FROM colegios_anteriores
       WHERE estudiante_id = $1
       ORDER BY orden ASC, colegio_ant_id ASC`, [estudianteId]);
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`SELECT 
      colegio_ant_id,
      estudiante_id,
      nombre_colegio,
      ciudad,
      grado_cursado,
      anio,
      orden
       FROM colegios_anteriores WHERE colegio_ant_id = $1`, [id]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    // ----------------------------------------------------------
    // create — agregar un colegio individual
    // El campo `orden` se asigna automáticamente como el siguiente
    // número disponible para ese estudiante
    // ----------------------------------------------------------
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            // Si no viene orden, calculamos el siguiente automáticamente
            const ordenFinal = (_a = data.orden) !== null && _a !== void 0 ? _a : yield ColegioAnteriorRepository
                .nextOrden(data.estudiante_id, client);
            const result = yield (0, database_1.query)(`INSERT INTO colegios_anteriores (
        estudiante_id,
        nombre_colegio,
        ciudad,
        grado_cursado,
        anio,
        orden
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`, [
                data.estudiante_id,
                data.nombre_colegio,
                (_b = data.ciudad) !== null && _b !== void 0 ? _b : null,
                (_c = data.grado_cursado) !== null && _c !== void 0 ? _c : null,
                (_d = data.anio) !== null && _d !== void 0 ? _d : null,
                ordenFinal,
            ], client);
            return result.rows[0];
        });
    }
    // ----------------------------------------------------------
    // replaceAll — reemplaza TODOS los colegios de un estudiante
    //
    // ¿Por qué este patrón en lugar de update individual?
    // El formulario muestra una lista editable de colegios.
    // Cuando el usuario guarda, manda la lista completa.
    // Es más simple borrar los anteriores e insertar los nuevos
    // que calcular qué cambió, qué se agregó y qué se eliminó.
    //
    // Analogía: como cuando reemplazas toda la lista de contactos
    // desde un backup — no actualizas uno por uno, restauras todo.
    //
    // IMPORTANTE: se hace dentro de una transacción para que si
    // el insert falla, el delete se revierta y no quedes sin datos.
    // ----------------------------------------------------------
    static replaceAll(estudianteId, colegios, client) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Borrar todos los colegios actuales
            yield (0, database_1.query)("DELETE FROM colegios_anteriores WHERE estudiante_id = $1", [estudianteId], client);
            if (colegios.length === 0)
                return [];
            // 2. Insertar los nuevos respetando el orden del array
            //    El índice del array define el campo `orden`
            const inserted = yield Promise.all(colegios.map((colegio, index) => ColegioAnteriorRepository.create(Object.assign(Object.assign({}, colegio), { estudiante_id: estudianteId, orden: index + 1 }), client)));
            return inserted;
        });
    }
    // ----------------------------------------------------------
    // update — actualizar un colegio individual por id
    // ----------------------------------------------------------
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE colegios_anteriores
       SET ${fields.join(", ")}
       WHERE colegio_ant_id = $${paramCount}
       RETURNING *`, values, client);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)("DELETE FROM colegios_anteriores WHERE colegio_ant_id = $1 RETURNING *", [id]);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    static deleteByEstudianteId(estudianteId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, database_1.query)("DELETE FROM colegios_anteriores WHERE estudiante_id = $1", [estudianteId]);
        });
    }
    // ----------------------------------------------------------
    // nextOrden — helper privado
    // Calcula el siguiente número de orden para un estudiante
    // Ej: si ya tiene 2 colegios, el próximo es orden = 3
    // ----------------------------------------------------------
    static nextOrden(estudianteId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT COALESCE(MAX(orden), 0) + 1 AS next_orden
       FROM colegios_anteriores
       WHERE estudiante_id = $1`, [estudianteId], client);
            return result.rows[0].next_orden;
        });
    }
}
exports.ColegioAnteriorRepository = ColegioAnteriorRepository;
//# sourceMappingURL=ColegioAnteriorRepository.js.map