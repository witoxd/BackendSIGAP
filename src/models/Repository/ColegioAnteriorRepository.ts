import { query } from "../../config/database"
import type { ColegioAnteriorCreationAttributes } from "../sequelize/ColegioAnterior"

export class ColegioAnteriorRepository {

  static async findByEstudianteId(estudianteId: number) {
    const result = await query(
      `SELECT 
      colegio_ant_id,
      estudiante_id,
      nombre_colegio,
      ciudad,
      grado_cursado,
      anio,
      orden
       FROM colegios_anteriores
       WHERE estudiante_id = $1
       ORDER BY orden ASC, colegio_ant_id ASC`,
      [estudianteId]
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT 
      colegio_ant_id,
      estudiante_id,
      nombre_colegio,
      ciudad,
      grado_cursado,
      anio,
      orden
       FROM colegios_anteriores WHERE colegio_ant_id = $1`, 
      [id]
    )
    return result.rows[0] ?? null
  }

  // ----------------------------------------------------------
  // create — agregar un colegio individual
  // El campo `orden` se asigna automáticamente como el siguiente
  // número disponible para ese estudiante
  // ----------------------------------------------------------
  static async create(
    data: Omit<ColegioAnteriorCreationAttributes, "colegio_ant_id">,
    client?: any
  ) {
    // Si no viene orden, calculamos el siguiente automáticamente
    const ordenFinal = data.orden ?? await ColegioAnteriorRepository
      .nextOrden(data.estudiante_id, client)

    const result = await query(
      `INSERT INTO colegios_anteriores (
        estudiante_id,
        nombre_colegio,
        ciudad,
        grado_cursado,
        anio,
        orden
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        data.estudiante_id,
        data.nombre_colegio,
        data.ciudad      ?? null,
        data.grado_cursado ?? null,
        data.anio        ?? null,
        ordenFinal,
      ],
      client
    )
    return result.rows[0]
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
  static async replaceAll(
    estudianteId: number,
    colegios: Omit<ColegioAnteriorCreationAttributes, "colegio_ant_id" | "estudiante_id" | "orden">[],
    client?: any
  ) {
    // 1. Borrar todos los colegios actuales
    await query(
      "DELETE FROM colegios_anteriores WHERE estudiante_id = $1",
      [estudianteId],
      client
    )

    if (colegios.length === 0) return []

    // 2. Insertar los nuevos respetando el orden del array
    //    El índice del array define el campo `orden`
    const inserted = await Promise.all(
      colegios.map((colegio, index) =>
        ColegioAnteriorRepository.create(
          { ...colegio, estudiante_id: estudianteId, orden: index + 1 },
          client
        )
      )
    )

    return inserted
  }

  // ----------------------------------------------------------
  // update — actualizar un colegio individual por id
  // ----------------------------------------------------------
  static async update(
    id: number,
    data: Partial<Omit<ColegioAnteriorCreationAttributes, "colegio_ant_id" | "estudiante_id">>,
    client?: any
  ) {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE colegios_anteriores
       SET ${fields.join(", ")}
       WHERE colegio_ant_id = $${paramCount}
       RETURNING *`,
      values,
      client
    )
    return result.rows[0] ?? null
  }

  static async delete(id: number) {
    const result = await query(
      "DELETE FROM colegios_anteriores WHERE colegio_ant_id = $1 RETURNING *",
      [id]
    )
    return result.rows[0] ?? null
  }

  static async deleteByEstudianteId(estudianteId: number) {
    await query(
      "DELETE FROM colegios_anteriores WHERE estudiante_id = $1",
      [estudianteId]
    )
  }

  // ----------------------------------------------------------
  // nextOrden — helper privado
  // Calcula el siguiente número de orden para un estudiante
  // Ej: si ya tiene 2 colegios, el próximo es orden = 3
  // ----------------------------------------------------------
  private static async nextOrden(
    estudianteId: number,
    client?: any
  ): Promise<number> {
    const result = await query(
      `SELECT COALESCE(MAX(orden), 0) + 1 AS next_orden
       FROM colegios_anteriores
       WHERE estudiante_id = $1`,
      [estudianteId],
      client
    )
    return result.rows[0].next_orden
  }
}