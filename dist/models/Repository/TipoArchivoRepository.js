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
exports.TipoArchivoRepository = void 0;
const database_1 = require("../../config/database");
class TipoArchivoRepository {
    /**
     * Obtener todos los tipos de archivo
     */
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM tipos_archivo WHERE activo = true ORDER BY nombre");
            return result.rows;
        });
    }
    static countByTipo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM archivos WHERE tipo_archivo_id = $1", [id]);
            return result.rows;
        });
    }
    /**
     * Buscar tipo de archivo por ID
     */
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM tipos_archivo WHERE tipo_archivo_id = $1", [id]);
            return result.rows[0];
        });
    }
    /**
     * Buscar tipo de archivo por nombre
     */
    static findByNombre(nombre) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM tipos_archivo WHERE nombre = $1", [nombre]);
            return result.rows[0];
        });
    }
    // ----------------------------------------------------------
    // create — ahora incluye requerido_en además de aplica_a.
    //
    // Usamos ::contexto_archivo[] para castear explícitamente —
    // pg no castea TEXT[] a un ENUM[] automáticamente en el INSERT,
    // pero sí con el cast explícito.
    // ----------------------------------------------------------
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const result = yield (0, database_1.query)(`INSERT INTO tipos_archivo
       (nombre, descripcion, extensiones_permitidas, activo, aplica_a, requerido_en)
     VALUES ($1, $2, $3, $4, $5::contexto_archivo[], $6::contexto_archivo[])
     RETURNING *`, [
                data.nombre,
                (_a = data.descripcion) !== null && _a !== void 0 ? _a : null,
                (_b = data.extensiones_permitidas) !== null && _b !== void 0 ? _b : null,
                (_c = data.activo) !== null && _c !== void 0 ? _c : true,
                (_d = data.aplica_a) !== null && _d !== void 0 ? _d : null,
                (_e = data.requerido_en) !== null && _e !== void 0 ? _e : null,
            ], client);
            return result.rows[0];
        });
    }
    // ----------------------------------------------------------
    // update — igual que create, el cast es necesario para
    // los arrays de ENUM.
    // ----------------------------------------------------------
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key === "tipo_archivo_id" || value === undefined)
                    return;
                // Los campos ENUM[] necesitan cast explícito
                if (key === "aplica_a" || key === "requerido_en") {
                    fields.push(`${key} = $${paramCount}::contexto_archivo[]`);
                }
                else {
                    fields.push(`${key} = $${paramCount}`);
                }
                values.push(value);
                paramCount++;
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE tipos_archivo
     SET ${fields.join(", ")}
     WHERE tipo_archivo_id = $${paramCount}
     RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    // ----------------------------------------------------------
    // findByRol — reemplaza el método existente.
    // Ahora filtra por aplica_a (campo ENUM[]) en lugar de string[].
    // La query es idéntica pero el tipo en BD es más seguro.
    // ----------------------------------------------------------
    static findByRol(rol) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT * FROM tipos_archivo
     WHERE activo = true
       AND ($1::contexto_archivo = ANY(aplica_a) OR aplica_a IS NULL)
     ORDER BY nombre`, [rol]);
            return result.rows;
        });
    }
    static findByContexto(contexto) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT * FROM tipo_archivos
    WHERE activo = true
    AND ($1::contexto_archivo = ANY(aplica_a) OR aplica_a IS NULL)
    ORDER BY nombre`, [contexto]);
            return result.rows;
        });
    }
    // ----------------------------------------------------------
    // findRequeridosPor — nuevo método, devuelve solo los tipos
    // que son OBLIGATORIOS en un contexto específico.
    // Usado por MatriculaArchivoRepository.findArchivosRequeridos
    // y por el checklist del frontend.
    // ----------------------------------------------------------
    static findRequeridosPor(contexto) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT * FROM tipos_archivo
     WHERE activo = true
       AND $1::contexto_archivo = ANY(requerido_en)
     ORDER BY nombre`, [contexto]);
            return result.rows;
        });
    }
    /**
     * Eliminar permanentemente un tipo de archivo
     */
    static hardDelete(id, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`DELETE FROM tipos_archivo 
       WHERE tipo_archivo_id = $1 
       RETURNING *`, [id], client);
            return result.rows[0];
        });
    }
    /**
     * SoftDelete un tipo de archivo
     */
    static softDelete(id, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`UPDATE tipos_archivo SET activo = false 
       WHERE tipo_archivo_id = $1 
       RETURNING *`, [id], client);
            return result.rows[0];
        });
    }
    /**
     * Contar tipos de archivo
     */
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM tipos_archivo WHERE activo = true");
            return Number.parseInt(result.rows[0].count);
        });
    }
    /**
     * Verificar si una extensión es permitida para un tipo de archivo
     */
    static isExtensionAllowed(tipoArchivoId, extension) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT extensiones_permitidas FROM tipos_archivo 
       WHERE tipo_archivo_id = $1`, [tipoArchivoId]);
            if (!result.rows[0])
                return false;
            const extensionesPermitidas = result.rows[0].extensiones_permitidas;
            // Si no hay extensiones específicas, permitir todas
            if (!extensionesPermitidas || extensionesPermitidas.length === 0) {
                return true;
            }
            // Verificar si la extensión está en la lista
            return extensionesPermitidas.includes(extension.toLowerCase());
        });
    }
}
exports.TipoArchivoRepository = TipoArchivoRepository;
//# sourceMappingURL=TipoArchivoRepository.js.map