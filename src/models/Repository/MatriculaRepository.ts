import { query } from "../../config/database"
import { MatriculaCreationAttributes } from "../sequelize/Matricula"

const V_MATRICULA_FIELDS_SQL = (prefije_table: string): string => {
  return `
${prefije_table}.matricula_id,
${prefije_table}.estudiante_id,
${prefije_table}.curso_id,
${prefije_table}.jornada_id,
${prefije_table}.periodo_id,
${prefije_table}.estado_actual,
${prefije_table}.fecha_matricula,
${prefije_table}.fecha_retiro,
${prefije_table}.motivo_retiro,
${prefije_table}.anio,
${prefije_table}.estado_actual
`
}
const PREVIEWS_V_MATRICULA_FIELDS_SQL = (prefije_table: string): string => {
  return `
${prefije_table}.matricula_id,
${prefije_table}.periodo_id,
${prefije_table}.estado_actual,
${prefije_table}.fecha_matricula,
${prefije_table}.fecha_retiro,
${prefije_table}.motivo_retiro,
${prefije_table}.anio,
${prefije_table}.estado_actual,
${prefije_table}.periodo_descripcion
`
}


const V_MATRICULA_FIELDS_JSON = (prefije_table: string): string => {
  return `
  SELECT json_build_object(
  'matricula_id', ${prefije_table}.matricula_id,
  'estudiante_id', ${prefije_table}.estudiante_id,
  'curso_id', ${prefije_table}.curso_id,
  'jornada_id', ${prefije_table}.jornada_id,
  'periodo_id', ${prefije_table}.periodo_id,
  'estado', ${prefije_table}.estado,
  'fecha_matricula', ${prefije_table}.fecha_matricula,
  'fecha_retiro', ${prefije_table}.fecha_retiro,
  'motivo_retiro', ${prefije_table}.motivo_retiro,
  'anio', ${prefije_table}.anio,
  'estado_actual', ${prefije_table}.estado_actual
  ) AS V_Matricula`
}



export class MatriculaRepository {

  // ----------------------------------------------------------
  // findAll — ahora usa la vista para traer estado_actual
  // Reemplazar el findAll existente por este
  // ----------------------------------------------------------
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT
       ${PREVIEWS_V_MATRICULA_FIELDS_SQL("vm")},
       p.nombres,
       p.apellido_paterno,
       p.apellido_materno,
       c.nombre AS curso_nombre,
       c.grado,
       e.estudiante_id,
       j.nombre AS jornada_nombre

     FROM v_matriculas vm
     INNER JOIN estudiantes e ON vm.estudiante_id = e.estudiante_id
     INNER JOIN personas p    ON e.persona_id     = p.persona_id
     INNER JOIN cursos c      ON vm.curso_id      = c.curso_id
     INNER JOIN jornadas j     ON vm.jornada_id   = j.jornada_id
     ORDER BY vm.anio DESC, vm.fecha_matricula DESC
     LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return result.rows
  }

  // ----------------------------------------------------------
  // findById — ahora incluye estado_actual de la vista
  // Reemplazar el findById existente por este
  // ----------------------------------------------------------
  static async findById(id: number) {
    const result = await query(
      `SELECT
       vm.*,
       p.nombres,
       p.apellido_paterno,
       p.apellido_materno,
       c.nombre AS curso_nombre,
       c.grado
     FROM v_matriculas vm
     INNER JOIN estudiantes e ON vm.estudiante_id = e.estudiante_id
     INNER JOIN personas p    ON e.persona_id     = p.persona_id
     INNER JOIN cursos c      ON vm.curso_id      = c.curso_id
     WHERE vm.matricula_id = $1`,
      [id]
    )
    return result.rows[0] ?? null
  }

  // ----------------------------------------------------------
  // findByEstudianteAndPeriodo — reemplaza findByEstudianteAndCurso
  // La validación ahora es por período, no por año libre
  // ----------------------------------------------------------
  static async findByEstudianteAndPeriodo(estudianteId: number, periodoId: number) {
    const result = await query(
      `SELECT * FROM matriculas
     WHERE estudiante_id = $1 AND periodo_id = $2`,
      [estudianteId, periodoId]
    )
    return result.rows[0] ?? null
  }

  // ----------------------------------------------------------
  // findByEstudiante — historial completo con estado calculado
  // ----------------------------------------------------------
  static async findByEstudiante(estudianteId: number) {
    const result = await query(
      `SELECT
       vm.*,
       c.nombre AS curso_nombre,
       c.grado
     FROM v_matriculas vm
     INNER JOIN cursos c ON vm.curso_id = c.curso_id
     WHERE vm.estudiante_id = $1
     ORDER BY vm.anio DESC, vm.fecha_matricula DESC`,
      [estudianteId]
    )
    return result.rows
  }

  // ----------------------------------------------------------
  // create — ya NO necesita anio_egreso (viene del período)
  // El trigger fn_verificar_periodo_activo valida en BD
  // que el período exista, esté activo y dentro de fechas
  // ----------------------------------------------------------
  static async create(data: Omit<MatriculaCreationAttributes, "matricula_id" | "anio_egreso">, client?: any) {
    const result = await query(
      `INSERT INTO matriculas
       (estudiante_id, curso_id, jornada_id, periodo_id, estado)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
      [
        data.estudiante_id,
        data.curso_id,
        data.jornada_id,
        data.periodo_id,
        "activa"
      ],
      client
    )
    return result.rows[0]
  }

  // ----------------------------------------------------------
  // retirar — único cambio de estado manual permitido
  // Los demás estados se derivan de las fechas automáticamente
  // ----------------------------------------------------------
  static async retirar(id: number, motivo?: string, client?: any) {
    const result = await query(
      `UPDATE matriculas
     SET
       estado        = 'retirada',
       fecha_retiro  = CURRENT_DATE,
       motivo_retiro = $2
     WHERE matricula_id = $1
     RETURNING *`,
      [id, motivo ?? null],
      client
    )
    return result.rows[0] ?? null
  }

  // ----------------------------------------------------------
  // findActivas — matrículas activas del período actual
  // Usa la vista — estado_actual = 'activa' significa que
  // el período está activo Y dentro de fechas
  // ----------------------------------------------------------
  static async findActivas(limit = 50, offset = 0) {
    const result = await query(
      `SELECT
       vm.*,
       p.nombres,
       p.apellido_paterno,
       c.nombre AS curso_nombre
     FROM v_matriculas vm
     INNER JOIN estudiantes e ON vm.estudiante_id = e.estudiante_id
     INNER JOIN personas p    ON e.persona_id     = p.persona_id
     INNER JOIN cursos c      ON vm.curso_id      = c.curso_id
     WHERE vm.estado_actual = 'activa'
     ORDER BY p.apellido_paterno, p.nombres
     LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return result.rows
  }

  async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT m.*, 
              e.*,
              p.nombres, p.apellido_paterno,
              c.nombre as curso_nombre
       FROM matriculas m
       INNER JOIN estudiantes e ON m.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       INNER JOIN cursos c ON m.curso_id = c.curso_id
       ORDER BY m.fecha_matricula DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }


  static async findByCurso(cursoId: number) {
    const result = await query(
      `SELECT m.*, 
              e.*,
              p.nombres, p.apellido_paterno, p.apellido_materno
       FROM matriculas m
       INNER JOIN estudiantes e ON m.estudiante_id = e.estudiante_id
       INNER JOIN personas p ON e.persona_id = p.persona_id
       WHERE m.curso_id = $1
       ORDER BY p.apellido_paterno, p.nombres`,
      [cursoId],
    )
    return result.rows
  }


  static async update(id: number, Data: Partial<MatriculaCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(Data).forEach(([key, value]) => {
      if (key !== "matricula_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE matriculas SET ${fields.join(", ")} WHERE matricula_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async delete(id: number) {
    const result = await query("DELETE FROM matriculas WHERE matricula_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM matriculas")
    return Number.parseInt(result.rows[0].count)
  }

  // Registra un snapshot ANTES de actualizar.
  // Llamar desde el controller ANTES de hacer el update.
  static async registrarHistorial(
    matriculaActual: any,
    datosNuevos: Partial<MatriculaCreationAttributes>,
    modificadoPor?: number,
    motivoCambio?: string,
    client?: any
  ) {
    await query(
      `INSERT INTO matriculas_historial
       (matricula_id, curso_id_anterior, jornada_id_anterior, estado_anterior,
        curso_id_nuevo, jornada_id_nuevo, estado_nuevo, modificado_por, motivo_cambio)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        matriculaActual.matricula_id,
        matriculaActual.curso_id,
        matriculaActual.jornada_id,
        matriculaActual.estado_raw ?? matriculaActual.estado,
        datosNuevos.curso_id ?? matriculaActual.curso_id,
        datosNuevos.jornada_id ?? matriculaActual.jornada_id,
        datosNuevos.estado ?? matriculaActual.estado_raw ?? matriculaActual.estado,
        modificadoPor ?? null,
        motivoCambio ?? null,
      ],
      client
    )
  }
}
