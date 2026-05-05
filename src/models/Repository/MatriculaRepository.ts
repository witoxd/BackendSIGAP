import { query } from "../../config/database"
import { MatriculaCreationAttributes } from "../sequelize/Matricula"

const PREVIEWS_V_MATRICULA_FIELDS_SQL = (prefije_table: string): string => {
  return `
${prefije_table}.matricula_id,
${prefije_table}.estado_actual,
${prefije_table}.fecha_matricula,
${prefije_table}.fecha_retiro,
${prefije_table}.motivo_retiro,
${prefije_table}.anio,
${prefije_table}.periodo_descripcion,
${prefije_table}.periodo_fecha_inicio,
${prefije_table}.periodo_fecha_fin
`
}


export class MatriculaRepository {

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
  // findByEstudiante — historial completo con estado calculado,
  // datos del curso, jornada y período.
  // ----------------------------------------------------------
  static async findByEstudiante(estudianteId: number) {
    const result = await query(
      `SELECT
        ${PREVIEWS_V_MATRICULA_FIELDS_SQL("vm")},
        c.nombre  AS curso_nombre,
        c.grado,
        j.nombre  AS jornada_nombre
      FROM v_matriculas vm
      INNER JOIN cursos   c ON vm.curso_id   = c.curso_id
      INNER JOIN jornadas j ON vm.jornada_id = j.jornada_id
      WHERE vm.estudiante_id = $1
      ORDER BY vm.anio DESC, vm.fecha_matricula DESC`,
      [estudianteId]
    )
    return result.rows
  }

  // ----------------------------------------------------------
  // findHistorialByMatricula — todos los snapshots de cambio
  // de una matrícula, con el nombre del usuario que modificó.
  // ----------------------------------------------------------
  static async findHistorialByMatricula(matriculaId: number) {
    const result = await query(
      `SELECT
        mh.historial_id,
        ca.nombre  AS curso_anterior_nombre,
        cn.nombre  AS curso_nuevo_nombre,
        ja.nombre  AS jornada_anterior_nombre,
        jn.nombre  AS jornada_nuevo_nombre,
        mh.estado_anterior,
        mh.estado_nuevo,
        mh.modificado_en,
        mh.motivo_cambio,
        u.username AS modificado_por_nombre
      FROM matriculas_historial mh
      LEFT JOIN cursos   ca ON mh.curso_id_anterior   = ca.curso_id
      LEFT JOIN cursos   cn ON mh.curso_id_nuevo       = cn.curso_id
      LEFT JOIN jornadas ja ON mh.jornada_id_anterior  = ja.jornada_id
      LEFT JOIN jornadas jn ON mh.jornada_id_nuevo     = jn.jornada_id
      LEFT JOIN usuarios  u ON mh.modificado_por       = u.usuario_id
      WHERE mh.matricula_id = $1
      ORDER BY mh.modificado_en ASC`,
      [matriculaId]
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

  static async findByCurso(cursoId: number) {
    const result = await query(
      `SELECT
        ${PREVIEWS_V_MATRICULA_FIELDS_SQL("vm")},
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        j.nombre AS jornada_nombre
      FROM v_matriculas vm
      INNER JOIN estudiantes e ON vm.estudiante_id = e.estudiante_id
      INNER JOIN personas    p ON e.persona_id     = p.persona_id
      INNER JOIN jornadas    j ON vm.jornada_id    = j.jornada_id
      WHERE vm.curso_id = $1
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

  // ----------------------------------------------------------
  // findDetalles — toda la información de una matrícula para
  // la página de detalles. Ejecuta 4 queries en paralelo:
  //   1. Datos base (matrícula + curso + jornada + período + estudiante)
  //   2. Archivos entregados
  //   3. Checklist de archivos requeridos
  //   4. Historial de cambios
  // ----------------------------------------------------------
  static async findDetalles(matriculaId: number) {
    const [baseResult, archivosResult, requeridosResult, historialResult] = await Promise.all([
      // 1. Datos base
      query(
        `SELECT
          vm.estado_actual,
          vm.fecha_matricula,
          vm.fecha_retiro,
          vm.motivo_retiro,
          vm.anio,
          json_build_object(
            'nombre', c.nombre,
            'grado',  c.grado
          ) AS curso,
          json_build_object(
            'nombre',      j.nombre,
            'hora_inicio', j.hora_inicio,
            'hora_fin',    j.hora_fin
          ) AS jornada,
          json_build_object(
            'descripcion',  vm.periodo_descripcion,
            'fecha_inicio', vm.periodo_fecha_inicio,
            'fecha_fin',    vm.periodo_fecha_fin
          ) AS periodo,
          json_build_object(
            'nombres',          p.nombres,
            'apellido_paterno', p.apellido_paterno,
            'apellido_materno', p.apellido_materno,
            'numero_documento', p.numero_documento,
            'nombre_documento', td.nombre_documento
          ) AS estudiante
        FROM v_matriculas vm
        INNER JOIN cursos         c  ON vm.curso_id        = c.curso_id
        INNER JOIN jornadas       j  ON vm.jornada_id      = j.jornada_id
        INNER JOIN estudiantes    e  ON vm.estudiante_id   = e.estudiante_id
        INNER JOIN personas       p  ON e.persona_id       = p.persona_id
        LEFT  JOIN tipo_documento td ON p.tipo_documento_id = td.tipo_documento_id
        WHERE vm.matricula_id = $1`,
        [matriculaId]
      ),

      // 2. Archivos entregados
      query(
        `SELECT
          a.nombre,
          a.url_archivo,
          a.descripcion,
          a.fecha_carga,
          json_build_object(
            'nombre', ta.nombre
          ) AS tipo_archivo
        FROM matricula_archivos ma
        INNER JOIN archivos      a  ON ma.archivo_id      = a.archivo_id
        INNER JOIN tipos_archivo ta ON a.tipo_archivo_id  = ta.tipo_archivo_id
        WHERE ma.matricula_id = $1
        ORDER BY ta.nombre, ma.fecha_asociacion`,
        [matriculaId]
      ),

      // 3. Checklist de tipos requeridos vs entregados
      query(
        `SELECT
          ta.nombre,
          ta.descripcion,
          CASE WHEN ma.id IS NOT NULL THEN true ELSE false END AS entregado,
          a.url_archivo,
          a.fecha_carga
        FROM tipos_archivo ta
        LEFT JOIN (
          SELECT ma2.id, ma2.archivo_id, a2.tipo_archivo_id
          FROM matricula_archivos ma2
          INNER JOIN archivos a2 ON ma2.archivo_id = a2.archivo_id
          WHERE ma2.matricula_id = $1
        ) ma ON ta.tipo_archivo_id = ma.tipo_archivo_id
        LEFT JOIN archivos a ON ma.archivo_id = a.archivo_id
        WHERE ta.activo = true
          AND 'matricula' = ANY(ta.requerido_en)
        ORDER BY entregado ASC, ta.nombre`,
        [matriculaId]
      ),

      // 4. Historial de cambios
      query(
        `SELECT
          ca.nombre  AS curso_anterior_nombre,
          cn.nombre  AS curso_nuevo_nombre,
          ja.nombre  AS jornada_anterior_nombre,
          jn.nombre  AS jornada_nuevo_nombre,
          mh.estado_anterior,
          mh.estado_nuevo,
          mh.modificado_en,
          mh.motivo_cambio,
          u.username AS modificado_por_nombre
        FROM matriculas_historial mh
        LEFT JOIN cursos   ca ON mh.curso_id_anterior  = ca.curso_id
        LEFT JOIN cursos   cn ON mh.curso_id_nuevo      = cn.curso_id
        LEFT JOIN jornadas ja ON mh.jornada_id_anterior = ja.jornada_id
        LEFT JOIN jornadas jn ON mh.jornada_id_nuevo    = jn.jornada_id
        LEFT JOIN usuarios  u ON mh.modificado_por      = u.usuario_id
        WHERE mh.matricula_id = $1
        ORDER BY mh.modificado_en ASC`,
        [matriculaId]
      ),
    ])

    const base = baseResult.rows[0]
    if (!base) return null

    return {
      ...base,
      archivos:           archivosResult.rows,
      archivos_requeridos: requeridosResult.rows,
      historial:          historialResult.rows,
    }
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
