"use strict";
// ============================================================================
// src/services/archivos.services.ts — CORREGIDO
// ============================================================================
//
// Cambio: ninguno de fondo. El servicio estaba bien, pero se añade
// deleteFile individual y mejor manejo de errores parciales.
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
exports.archivoMatriculaService = exports.archivoService = void 0;
const multer_1 = require("../config/multer");
class archivoService {
    // Elimina un array de archivos físicos del disco.
    // Usa Promise.allSettled en lugar de Promise.all para que un archivo
    // que ya no existe en disco no cancele la eliminación del resto.
    //
    // Analogía: si tienes 5 papeles para romper y uno ya no está,
    // igual rompes los otros 4 — no abandones la tarea.
    static deleteFileArray(files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!files || files.length === 0)
                return;
            const results = yield Promise.allSettled(files.map(file => (0, multer_1.deleteFile)(file.path)));
            const fallos = results.filter(r => r.status === "rejected");
            if (fallos.length > 0) {
                console.error(`[archivoService] No se pudieron eliminar ${fallos.length}/${files.length} archivos:`, fallos.map(f => f.reason));
            }
        });
    }
    // Elimina un único archivo físico del disco.
    static deleteOne(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, multer_1.deleteFile)(filePath);
            }
            catch (error) {
                console.error(`[archivoService] No se pudo eliminar el archivo ${filePath}:`, error);
            }
        });
    }
}
exports.archivoService = archivoService;
// ============================================================================
// src/services/archivosMatricula.services.ts — CORREGIDO
// ============================================================================
//
// Bugs corregidos:
//
// 1. asociarBulkArchivoMatricula:
//    ANTES: `ArchivoRepository.findById(Number(archivo_id[id]))`
//           donde `id` era el ÍNDICE del array, no el ID del archivo.
//           Para archivo_ids = [10, 20, 30]:
//             iteración 0 → findById(archivo_id[0]) = findById(10) ✓
//             iteración 1 → findById(archivo_id[1]) = findById(20) ✓
//           Pero el problema real era que `for (const id of archivo_id)`
//           itera sobre los VALORES, no los índices. Entonces:
//             id = 10 → findById(archivo_id[10]) = findById(undefined) → NaN ✗
//
// 2. transaction() no se esperaba (faltaba await).
//
// 3. El parámetro `personaId` se recibía pero nunca se usaba — se elimina
//    para que la firma del método sea honesta.
const database_1 = require("../config/database");
const ArchivoRepository_1 = require("../models/Repository/ArchivoRepository");
const MatriculaArchivoRepository_1 = require("../models/Repository/MatriculaArchivoRepository");
const MatriculaRepository_1 = require("../models/Repository/MatriculaRepository");
const AppError_1 = require("../utils/AppError");
class archivoMatriculaService {
    // Asocia un único archivo ya existente a una matrícula.
    // El archivo debe pertenecer al mismo estudiante de la matrícula.
    asociarArchivoMatricula(matriculaId, archivoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const matricula = yield MatriculaRepository_1.MatriculaRepository.findById(matriculaId);
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(archivoId);
            if (!archivo)
                throw new AppError_1.AppError("Archivo no encontrado", 404);
            // Garantía de integridad: el archivo debe ser del estudiante de la matrícula,
            // no de otra persona. Sin esta validación, cualquier usuario con acceso
            // podría adjuntar documentos ajenos a una matrícula.
            if (archivo.persona_id !== matricula.persona_id) {
                throw new AppError_1.AppError("El archivo no pertenece al estudiante de esta matrícula", 403);
            }
            const asociacion = yield MatriculaArchivoRepository_1.MatriculaArchivoRepository.asociar({
                matricula_id: matriculaId,
                archivo_id: archivoId,
            });
            // ON CONFLICT DO NOTHING devuelve null si ya existía la asociación.
            // No es un error — es idempotente.
            if (!asociacion) {
                // Ya estaba asociado, no hay nada más que hacer.
                return;
            }
        });
    }
    // Asocia múltiples archivos ya existentes a una matrícula en una
    // sola transacción. Si algún archivo no pertenece al estudiante,
    // toda la operación se revierte.
    //
    // BUG ORIGINAL:
    //   for (const id of archivo_id) {
    //     // id aquí es el VALOR del array (el ID del archivo), p.ej. 10, 20, 30
    //     const archivo = await ArchivoRepository.findById(Number(archivo_id[id]))
    //     //                                                          ^^^^^^^^^^^
    //     // archivo_id[10] = undefined porque el array solo tiene índices 0,1,2
    //   }
    //
    // FIX: iterar sobre los valores directamente.
    asociarBulkArchivoMatricula(matriculaId, archivoIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (archivoIds.length === 0)
                return;
            const matricula = yield MatriculaRepository_1.MatriculaRepository.findById(matriculaId);
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            // Validar todos los archivos ANTES de iniciar la transacción
            // (fail-fast: mejor fallar rápido que a medias dentro de una tx).
            for (const archivoId of archivoIds) {
                const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(archivoId);
                if (!archivo) {
                    throw new AppError_1.AppError(`Archivo con ID ${archivoId} no encontrado`, 404);
                }
                if (archivo.persona_id !== matricula.persona_id) {
                    throw new AppError_1.AppError(`El archivo ${archivoId} no pertenece al estudiante de esta matrícula`, 403);
                }
            }
            // Todas las validaciones pasaron — persistir en una sola transacción.
            yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                yield MatriculaArchivoRepository_1.MatriculaArchivoRepository.asociarBulk(matriculaId, archivoIds, client);
            }));
        });
    }
}
exports.archivoMatriculaService = archivoMatriculaService;
//# sourceMappingURL=archivosMatricula.services.js.map