// ============================================================================
// src/services/archivos.services.ts — CORREGIDO
// ============================================================================
//
// Cambio: ninguno de fondo. El servicio estaba bien, pero se añade
// deleteFile individual y mejor manejo de errores parciales.

import { deleteFile } from "../config/multer"

export class archivoService {

  // Elimina un array de archivos físicos del disco.
  // Usa Promise.allSettled en lugar de Promise.all para que un archivo
  // que ya no existe en disco no cancele la eliminación del resto.
  //
  // Analogía: si tienes 5 papeles para romper y uno ya no está,
  // igual rompes los otros 4 — no abandones la tarea.
  static async deleteFileArray(files: Express.Multer.File[]): Promise<void> {
    if (!files || files.length === 0) return

    const results = await Promise.allSettled(
      files.map(file => deleteFile(file.path))
    )

    const fallos = results.filter(r => r.status === "rejected")
    if (fallos.length > 0) {
      console.error(
        `[archivoService] No se pudieron eliminar ${fallos.length}/${files.length} archivos:`,
        fallos.map(f => (f as PromiseRejectedResult).reason)
      )
    }
  }

  // Elimina un único archivo físico del disco.
  static async deleteOne(filePath: string): Promise<void> {
    try {
      await deleteFile(filePath)
    } catch (error) {
      console.error(`[archivoService] No se pudo eliminar el archivo ${filePath}:`, error)
    }
  }
}


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

import { transaction } from "../config/database"
import { ArchivoRepository } from "../models/Repository/ArchivoRepository"
import { MatriculaArchivoRepository } from "../models/Repository/MatriculaArchivoRepository"
import { MatriculaRepository } from "../models/Repository/MatriculaRepository"
import { AppError } from "../utils/AppError"

export class archivoMatriculaService {

  // Asocia un único archivo ya existente a una matrícula.
  // El archivo debe pertenecer al mismo estudiante de la matrícula.
  async asociarArchivoMatricula(matriculaId: number, archivoId: number): Promise<void> {
    const matricula = await MatriculaRepository.findById(matriculaId)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    const archivo = await ArchivoRepository.findById(archivoId)
    if (!archivo) throw new AppError("Archivo no encontrado", 404)

    // Garantía de integridad: el archivo debe ser del estudiante de la matrícula,
    // no de otra persona. Sin esta validación, cualquier usuario con acceso
    // podría adjuntar documentos ajenos a una matrícula.
    if (archivo.persona_id !== matricula.persona_id) {
      throw new AppError(
        "El archivo no pertenece al estudiante de esta matrícula",
        403
      )
    }

    const asociacion = await MatriculaArchivoRepository.asociar({
      matricula_id: matriculaId,
      archivo_id: archivoId,
    })

    // ON CONFLICT DO NOTHING devuelve null si ya existía la asociación.
    // No es un error — es idempotente.
    if (!asociacion) {
      // Ya estaba asociado, no hay nada más que hacer.
      return
    }
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
  async asociarBulkArchivoMatricula(matriculaId: number, archivoIds: number[]): Promise<void> {
    if (archivoIds.length === 0) return

    const matricula = await MatriculaRepository.findById(matriculaId)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    // Validar todos los archivos ANTES de iniciar la transacción
    // (fail-fast: mejor fallar rápido que a medias dentro de una tx).
    for (const archivoId of archivoIds) {
      const archivo = await ArchivoRepository.findById(archivoId)

      if (!archivo) {
        throw new AppError(`Archivo con ID ${archivoId} no encontrado`, 404)
      }

      if (archivo.persona_id !== matricula.persona_id) {
        throw new AppError(
          `El archivo ${archivoId} no pertenece al estudiante de esta matrícula`,
          403
        )
      }
    }

    // Todas las validaciones pasaron — persistir en una sola transacción.
    await transaction(async (client) => {
      await MatriculaArchivoRepository.asociarBulk(matriculaId, archivoIds, client)
    })
  }
}