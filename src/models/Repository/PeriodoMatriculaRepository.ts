import { query } from "../../config/database"
import type { PeriodoMatriculaCreationAttributes } from "../sequelize/PeriodoMatricula"

export class PeriodoMatriculaRepository {

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
  static async findActivo() {
    const result = await query(
      `SELECT * FROM periodos_matricula WHERE activo = true LIMIT 1`
    )
    return result.rows[0] ?? null
  }

  static async findAll() {
    const result = await query(
      `SELECT * FROM periodos_matricula ORDER BY anio DESC, fecha_inicio DESC`
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT * FROM periodos_matricula WHERE periodo_id = $1`,
      [id]
    )
    return result.rows[0] ?? null
  }

  static async findByAnio(anio: number) {
    const result = await query(
      `SELECT * FROM periodos_matricula WHERE anio = $1`,
      [anio]
    )
    return result.rows
  }

  static async create(
    data: Omit<PeriodoMatriculaCreationAttributes, "periodo_id">,
    client?: any
  ) {
    const result = await query(
      `INSERT INTO periodos_matricula
         (anio, fecha_inicio, fecha_fin, activo, descripcion, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.anio,
        data.fecha_inicio,
        data.fecha_fin,
        data.activo ?? false,
        data.descripcion ?? null,
        data.created_by  ?? null,
      ],
      client
    )
    return result.rows[0]
  }

  // ----------------------------------------------------------
  // activar — habilita un período y desactiva cualquier otro.
  //
  // Aunque el índice parcial ya rechaza dos activos simultáneos
  // a nivel de BD, hacemos el UPDATE en dos pasos dentro de una
  // transacción para dar un mensaje de error claro al usuario
  // en lugar de un error de constraint crudo de PostgreSQL.
  // ----------------------------------------------------------
  static async activar(id: number, client?: any) {
    // Primero desactivar cualquier período activo existente
    await query(
      `UPDATE periodos_matricula SET activo = false WHERE activo = true`,
      [],
      client
    )
    // Luego activar el período solicitado
    const result = await query(
      `UPDATE periodos_matricula
       SET activo = true
       WHERE periodo_id = $1
       RETURNING *`,
      [id],
      client
    )
    return result.rows[0] ?? null
  }

  // ----------------------------------------------------------
  // desactivar — cierra el proceso de matrícula.
  // Ninguna matrícula nueva se podrá crear hasta que el admin
  // active otro período.
  // ----------------------------------------------------------
  static async desactivar(id: number, client?: any) {
    const result = await query(
      `UPDATE periodos_matricula
       SET activo = false
       WHERE periodo_id = $1
       RETURNING *`,
      [id],
      client
    )
    return result.rows[0] ?? null
  }

  static async update(
    id: number,
    data: Partial<Omit<PeriodoMatriculaCreationAttributes, "periodo_id">>,
    client?: any
  ) {
    // No se puede actualizar `activo` directamente — usar activar/desactivar
    const { activo: _activo, ...safeData } = data as any

    const fields: string[] = []
    const values: any[]   = []
    let paramCount = 1

    Object.entries(safeData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE periodos_matricula
       SET ${fields.join(", ")}
       WHERE periodo_id = $${paramCount}
       RETURNING *`,
      values,
      client
    )
    return result.rows[0] ?? null
  }

  static async delete(id: number) {
    // Solo se puede eliminar si no tiene matrículas asociadas
    const result = await query(
      `DELETE FROM periodos_matricula
       WHERE periodo_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM matriculas WHERE periodo_id = $1
         )
       RETURNING *`,
      [id]
    )
    return result.rows[0] ?? null
  }

  static async count() {
    const result = await query(
      `SELECT COUNT(*) FROM periodos_matricula`
    )
    return Number.parseInt(result.rows[0].count)
  }

  // ----------------------------------------------------------
  // tieneMatriculas — útil antes de intentar eliminar
  // ----------------------------------------------------------
  static async tieneMatriculas(id: number): Promise<boolean> {
    const result = await query(
      `SELECT EXISTS(
         SELECT 1 FROM matriculas WHERE periodo_id = $1
       ) AS tiene`,
      [id]
    )
    return result.rows[0].tiene
  }
}
