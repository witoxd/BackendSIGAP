// shared/personaSql.ts
//
// Centraliza los fragmentos SQL relacionados con personas que se repiten
// en los repositorios de Estudiante, Profesor, Administrativo y Acudiente.
//
// Analogía: igual que un componente React reutilizable — defines la pieza
// una sola vez y la importas donde la necesites. Si mañana agregas un campo
// nuevo a `personas`, solo tocas este archivo.

// ----------------------------------------------------------
// PERSONA_FIELDS — columnas que se traen de personas + tipo_documento
// Siempre con alias de tabla "p" para personas y "td" para tipo_documento
// ----------------------------------------------------------
export const PERSONA_FIELDS_SQL = `
  p.nombres,
  p.apellido_paterno,
  p.apellido_materno,
  p.tipo_documento_id,
  td.tipo_documento,
  p.numero_documento,
  p.fecha_nacimiento,
  p.genero,
  p.grupo_sanguineo,
  p.grupo_etnico,
  p.credo_religioso,
  p.lugar_nacimiento,
  p.serial_registro_civil,
  p.expedida_en
`.trim()

export const PERSONA_FIELDS_JSON = `
    json_build_object(
        'persona_id', p.persona_id,
        'nombres', p.nombres,
        'apellido_paterno', p.apellido_paterno,
        'apellido_materno', p.apellido_materno,
        'grupo_sanguineo', p.grupo_sanguineo,
        'fecha_nacimiento', p.fecha_nacimiento,
        'genero', p.genero,
        'numero_documento', p.numero_documento,
        'grupo_etnico', p.grupo_etnico,
        'credo_religioso', p.credo_religioso,
        'lugar_nacimiento', p.lugar_nacimiento,
        'serial_registro_civil', p.serial_registro_civil,
        'expedida_en', p.expedida_en,
        'tipo_documento', json_build_object(
          'tipo_documento_id', td.tipo_documento_id,
          'tipo_documento', td.tipo_documento
        )
      ) AS persona
`.trim()

// ----------------------------------------------------------
// personaJoin — función que genera el JOIN con alias dinámico
//
// ¿Por qué función y no string constante?
// Porque el alias de la tabla principal cambia en cada repositorio:
//   - estudiantes usa alias "e"
//   - acudientes usa alias "a"
//   - profesores usa alias "pr"
//   - administrativos usa alias "ad"
//
// Uso:
//   personaJoin("e")  →  "INNER JOIN personas p ON e.persona_id = p.persona_id
//                         LEFT  JOIN tipo_documento td ON ..."
// ----------------------------------------------------------
export const personaJoin = (tableAlias: string) => `
  INNER JOIN personas p  ON ${tableAlias}.persona_id = p.persona_id
  LEFT  JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
`.trim()

// ----------------------------------------------------------
// buildUpdateQuery — constructor dinámico de UPDATE
//
// El patrón Object.entries + paramCount se repetía identico
// en PersonaRepository, AcudienteRepository, MatriculaRepository...
// Lo extraemos aquí para no duplicarlo más.
//
// Retorna { sql, values } listo para pasar a query()
//
// Uso:
//   const { sql, values } = buildUpdateQuery(
//     "acudientes", "acudiente_id", id, data, ["acudiente_id"]
//   )
//   await query(sql, values, client)
// ----------------------------------------------------------
export const buildUpdateQuery = (
  tableName: string,
  primaryKey: string,
  id: number,
  data: Record<string, any>,
  excludeKeys: string[] = []
): { sql: string; values: any[] } | null => {
  const excluded = new Set([primaryKey, ...excludeKeys])
  const fields: string[] = []
  const values: any[] = []
  let paramCount = 1

  for (const [key, value] of Object.entries(data)) {
    if (!excluded.has(key) && value !== undefined) {
      fields.push(`${key} = $${paramCount}`)
      values.push(value)
      paramCount++
    }
  }

  if (fields.length === 0) return null

  values.push(id)

  return {
    sql: `UPDATE ${tableName}
          SET ${fields.join(", ")}
          WHERE ${primaryKey} = $${paramCount}
          RETURNING *`,
    values,
  }
}

// ----------------------------------------------------------
// buildUpsertQuery — constructor para INSERT ... ON CONFLICT
//
// Centraliza el patrón upsert que se repetía en
// FichaEstudianteRepository y ViviendaEstudianteRepository.
//
// Uso:
//   const { sql, values } = buildUpsertQuery(
//     "ficha_estudiante",
//     "estudiante_id",
//     estudianteId,
//     data
//   )
//   await query(sql, values, client)
// ----------------------------------------------------------
export const buildUpsertQuery = (
  tableName: string,
  conflictKey: string,
  conflictValue: number,
  data: Record<string, any>
): { sql: string; values: any[] } | null => {
  const fields = Object.keys(data).filter(
    (k) => k !== conflictKey && data[k] !== undefined
  )

  if (fields.length === 0) return null

  const values = fields.map((f) => data[f])
  const insertColumns    = [conflictKey, ...fields].join(", ")
  const insertPlaceholders = ["$1", ...fields.map((_, i) => `$${i + 2}`)].join(", ")
  const updateClause     = fields.map((f, i) => `${f} = $${i + 2}`).join(", ")

  return {
    sql: `INSERT INTO ${tableName} (${insertColumns})
          VALUES (${insertPlaceholders})
          ON CONFLICT (${conflictKey})
          DO UPDATE SET ${updateClause}, updated_at = NOW()
          RETURNING *`,
    values: [conflictValue, ...values],
  }
}