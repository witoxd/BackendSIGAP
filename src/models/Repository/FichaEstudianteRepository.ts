import { query } from "../../config/database"
import type { FichaEstudianteCreationAttributes } from "../sequelize/FichaEstudiante"

export class FichaEstudianteRepository {

  static async findByEstudianteId(estudianteId: number) {
    const result = await query(
      `SELECT
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
       FROM ficha_estudiante f WHERE f.estudiante_id = $1`,
      [estudianteId]
    )
    return result.rows[0] ?? null
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
  static async upsert(
    estudianteId: number,
    data: Partial<Omit<FichaEstudianteCreationAttributes, "ficha_id" | "estudiante_id">>,
    client?: any
  ) {
    const fields = Object.keys(data).filter(
      (k) => data[k as keyof typeof data] !== undefined
    )

    if (fields.length === 0) return null

    const values = fields.map((f) => data[f as keyof typeof data])

    // Construimos dinámicamente:
    // INSERT INTO ficha_estudiante (estudiante_id, campo1, campo2, ...)
    // VALUES ($1, $2, $3, ...)
    // ON CONFLICT (estudiante_id)
    // DO UPDATE SET campo1 = $2, campo2 = $3, ..., updated_at = NOW()
    const insertColumns = ["estudiante_id", ...fields].join(", ")
    const insertPlaceholders = ["$1", ...fields.map((_, i) => `$${i + 2}`)].join(", ")
    const updateClause = fields
      .map((f, i) => `${f} = $${i + 2}`)
      .join(", ")

    const result = await query(
      `INSERT INTO ficha_estudiante (${insertColumns})
       VALUES (${insertPlaceholders})
       ON CONFLICT (estudiante_id)
       DO UPDATE SET ${updateClause}, updated_at = NOW()
       RETURNING *`,
      [estudianteId, ...values],
      client
    )
    return result.rows[0]
  }

  // ----------------------------------------------------------
  // delete — eliminar ficha (caso borde: corrección de datos)
  // En cascada desde estudiantes, pero útil para limpiar
  // ----------------------------------------------------------
  static async delete(estudianteId: number) {
    const result = await query(
      "DELETE FROM ficha_estudiante WHERE estudiante_id = $1 RETURNING *",
      [estudianteId]
    )
    return result.rows[0] ?? null
  }
}