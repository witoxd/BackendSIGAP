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
exports.MatriculaArchivoRepository = void 0;
const database_1 = require("../../config/database");
class MatriculaArchivoRepository {
    // ----------------------------------------------------------
    // findByMatricula — todos los archivos de una matrícula,
    // con el detalle del archivo y su tipo para mostrar en UI.
    // ----------------------------------------------------------
    static findByMatricula(matriculaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT
         ma.id,
         ma.matricula_id,
         ma.fecha_asociacion,
         json_build_object(
           'archivo_id',      a.archivo_id,
           'nombre',          a.nombre,
           'url_archivo',     a.url_archivo,
           'descripcion',     a.descripcion,
           'fecha_carga',     a.fecha_carga,
           'tipo_archivo', json_build_object(
             'tipo_archivo_id', ta.tipo_archivo_id,
             'nombre',          ta.nombre,
             'requerido_en',    ta.requerido_en
           )
         ) AS archivo
       FROM matricula_archivos ma
       INNER JOIN archivos a      ON ma.archivo_id      = a.archivo_id
       INNER JOIN tipos_archivo ta ON a.tipo_archivo_id = ta.tipo_archivo_id
       WHERE ma.matricula_id = $1
       ORDER BY ta.nombre, ma.fecha_asociacion`, [matriculaId]);
            return result.rows;
        });
    }
    // ----------------------------------------------------------
    // findArchivosRequeridos — qué tipos de archivo son
    // obligatorios para matrícula y cuáles ya fueron entregados.
    //
    // Útil para mostrar un checklist en el frontend:
    //   ✓ Documento de identidad
    //   ✓ Boletín de notas
    //   ✗ Certificado de salud  ← falta
    // ----------------------------------------------------------
    static findArchivosRequeridos(matriculaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT
         ta.tipo_archivo_id,
         ta.nombre,
         ta.descripcion,
         ta.extensiones_permitidas,
         CASE WHEN ma.id IS NOT NULL THEN true ELSE false END AS entregado,
         ma.archivo_id,
         ma.fecha_asociacion
       FROM tipos_archivo ta
       LEFT JOIN (
         SELECT ma2.*, a.tipo_archivo_id
         FROM matricula_archivos ma2
         INNER JOIN archivos a ON ma2.archivo_id = a.archivo_id
         WHERE ma2.matricula_id = $1
       ) ma ON ta.tipo_archivo_id = ma.tipo_archivo_id
       WHERE ta.activo = true
         AND 'matricula' = ANY(ta.requerido_en)
       ORDER BY entregado ASC, ta.nombre`, [matriculaId]);
            return result.rows;
        });
    }
    // ----------------------------------------------------------
    // asociar — vincula un archivo existente a una matrícula.
    //
    // El archivo ya fue subido previamente (o en este momento)
    // y vive en la tabla `archivos`. Aquí solo lo referenciamos.
    // El UNIQUE(matricula_id, archivo_id) en la BD evita duplicados.
    // ----------------------------------------------------------
    static asociar(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`INSERT INTO matricula_archivos (matricula_id, archivo_id)
       VALUES ($1, $2)
       ON CONFLICT (matricula_id, archivo_id) DO NOTHING
       RETURNING *`, [data.matricula_id, data.archivo_id], client);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    // ----------------------------------------------------------
    // asociarBulk — vincula varios archivos a una matrícula
    // en un solo INSERT, útil cuando el estudiante sube varios
    // documentos al mismo tiempo al crear la matrícula.
    // ----------------------------------------------------------
    static asociarBulk(matriculaId, archivoIds, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (archivoIds.length === 0)
                return [];
            const placeholders = archivoIds
                .map((_, i) => `($1, $${i + 2})`)
                .join(", ");
            const result = yield (0, database_1.query)(`INSERT INTO matricula_archivos (matricula_id, archivo_id)
       VALUES ${placeholders}
       ON CONFLICT (matricula_id, archivo_id) DO NOTHING
       RETURNING *`, [matriculaId, ...archivoIds], client);
            return result.rows;
        });
    }
    // ----------------------------------------------------------
    // desasociar — quita el vínculo entre archivo y matrícula.
    // El archivo físico NO se elimina — sigue en `archivos`
    // asociado a la persona.
    // ----------------------------------------------------------
    static desasociar(matriculaId, archivoId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield (0, database_1.query)(`DELETE FROM matricula_archivos
       WHERE matricula_id = $1 AND archivo_id = $2
       RETURNING *`, [matriculaId, archivoId], client);
            return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
        });
    }
    // ----------------------------------------------------------
    // desasociarTodos — elimina todos los vínculos de una matrícula.
    // Se usa en cascada si se elimina la matrícula.
    // Los archivos físicos permanecen intactos.
    // ----------------------------------------------------------
    static desasociarTodos(matriculaId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, database_1.query)(`DELETE FROM matricula_archivos WHERE matricula_id = $1`, [matriculaId], client);
        });
    }
    static count(matriculaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT COUNT(*) FROM matricula_archivos WHERE matricula_id = $1`, [matriculaId]);
            return Number.parseInt(result.rows[0].count);
        });
    }
}
exports.MatriculaArchivoRepository = MatriculaArchivoRepository;
//# sourceMappingURL=MatriculaArchivoRepository.js.map