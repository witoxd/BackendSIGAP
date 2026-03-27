import { query } from "../../config/database"
import type { MatriculaArchivoCreationAttributes } from "../sequelize/MatriculaArchivo"

export class MatriculaArchivoRepository {

  // ----------------------------------------------------------
  // findByMatricula — todos los archivos de una matrícula,
  // con el detalle del archivo y su tipo para mostrar en UI.
  // ----------------------------------------------------------
  static async findByMatricula(matriculaId: number) {
    const result = await query(
      `SELECT
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
       ORDER BY ta.nombre, ma.fecha_asociacion`,
      [matriculaId]
    )
    return result.rows
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
  static async findArchivosRequeridos(matriculaId: number) {
    const result = await query(
      `SELECT
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
       ORDER BY entregado ASC, ta.nombre`,
      [matriculaId]
    )
    return result.rows
  }

  // ----------------------------------------------------------
  // asociar — vincula un archivo existente a una matrícula.
  //
  // El archivo ya fue subido previamente (o en este momento)
  // y vive en la tabla `archivos`. Aquí solo lo referenciamos.
  // El UNIQUE(matricula_id, archivo_id) en la BD evita duplicados.
  // ----------------------------------------------------------
  static async asociar(
    data: Omit<MatriculaArchivoCreationAttributes, "id" | "fecha_asociacion">,
    client?: any
  ) {
    const result = await query(
      `INSERT INTO matricula_archivos (matricula_id, archivo_id)
       VALUES ($1, $2)
       ON CONFLICT (matricula_id, archivo_id) DO NOTHING
       RETURNING *`,
      [data.matricula_id, data.archivo_id],
      client
    )
    return result.rows[0] ?? null
  }

  // ----------------------------------------------------------
  // asociarBulk — vincula varios archivos a una matrícula
  // en un solo INSERT, útil cuando el estudiante sube varios
  // documentos al mismo tiempo al crear la matrícula.
  // ----------------------------------------------------------
  static async asociarBulk(
    matriculaId: number,
    archivoIds: number[],
    client?: any
  ) {
    if (archivoIds.length === 0) return []

    const placeholders = archivoIds
      .map((_, i) => `($1, $${i + 2})`)
      .join(", ")

    const result = await query(
      `INSERT INTO matricula_archivos (matricula_id, archivo_id)
       VALUES ${placeholders}
       ON CONFLICT (matricula_id, archivo_id) DO NOTHING
       RETURNING *`,
      [matriculaId, ...archivoIds],
      client
    )
    return result.rows
  }

  // ----------------------------------------------------------
  // desasociar — quita el vínculo entre archivo y matrícula.
  // El archivo físico NO se elimina — sigue en `archivos`
  // asociado a la persona.
  // ----------------------------------------------------------
  static async desasociar(matriculaId: number, archivoId: number, client?: any) {
    const result = await query(
      `DELETE FROM matricula_archivos
       WHERE matricula_id = $1 AND archivo_id = $2
       RETURNING *`,
      [matriculaId, archivoId],
      client
    )
    return result.rows[0] ?? null
  }

  // ----------------------------------------------------------
  // desasociarTodos — elimina todos los vínculos de una matrícula.
  // Se usa en cascada si se elimina la matrícula.
  // Los archivos físicos permanecen intactos.
  // ----------------------------------------------------------
  static async desasociarTodos(matriculaId: number, client?: any) {
    await query(
      `DELETE FROM matricula_archivos WHERE matricula_id = $1`,
      [matriculaId],
      client
    )
  }

  static async count(matriculaId: number) {
    const result = await query(
      `SELECT COUNT(*) FROM matricula_archivos WHERE matricula_id = $1`,
      [matriculaId]
    )
    return Number.parseInt(result.rows[0].count)
  }
}
