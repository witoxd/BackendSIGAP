import { query } from "../../config/database"
import type { ArchivosCreationAttributes } from "../sequelize/Archivo"

export class ArchivoRepository {
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT 
        a.archivo_id,
        a.persona_id,
        a.tipo_archivo_id,
        a.nombre,
        a.url_archivo,
        a.descripcion,
        a.asignado_por,
        a.fecha_carga,
        a.activo,
       FROM archivos a WHERE a.activo = true
       ORDER BY a.fecha_carga DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return result.rows
  }

  static async findById(id: number) {
    const result = await query(
      `SELECT
        a.archivo_id,
        a.persona_id,
        a.tipo_archivo_id,
        a.nombre,
        a.url_archivo,
        a.descripcion,
        a.asignado_por,
        a.fecha_carga,
        a.activo,
       FROM archivos a WHERE a.activo = true
       WHERE a.archivo_id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findByPersonaId(personaId: number) {
    const result = await query(`SELECT
        a.archivo_id,
        a.persona_id,
        a.tipo_archivo_id,
        a.nombre,
        a.url_archivo,
        a.descripcion,
        a.asignado_por,
        a.fecha_carga,
        a.activo, FROM archivos WHERE persona_id = $1 AND activo = true
       ORDER BY fecha_carga DESC`, [personaId])
    return result.rows
  }

  static async findByTipo(tipoarchivos: number, limit = 50, offset = 0) {
    const result = await query(
      `SELECT 
        a.archivo_id,
        a.persona_id,
        a.tipo_archivo_id,
        a.nombre,
        a.url_archivo,
        a.descripcion,
        a.asignado_por,
        a.fecha_carga,
        a.activo,
       FROM archivos a
       LEFT JOIN personas p ON a.persona_id = p.persona_id
       WHERE a.tipo_archivo_id = $1 AND a.activo = true
       ORDER BY a.fecha_carga DESC LIMIT $2 OFFSET $3`,
      [tipoarchivos, limit, offset],
    )
    return result.rows
  }

  static async findByTipoAndPerson(tipoarchivos: number, persona_id: number, limit = 50, offset = 0) {
    const result = await query(
      `SELECT
        a.archivo_id,
        a.persona_id,
        a.tipo_archivo_id,
        a.nombre,
        a.url_archivo,
        a.descripcion,
        a.asignado_por,
        a.fecha_carga,
        a.activo,
       FROM archivos a
       LEFT JOIN personas p ON a.persona_id = p.persona_id
       WHERE a.tipo_archivo_id = $1 AND a.persona_id = $2 AND a.activo = true
       ORDER BY a.fecha_carga DESC LIMIT $3 OFFSET $4`,
      [tipoarchivos, persona_id, limit, offset],
    )
    return result.rows
  }

  static async findPhotoByPersonaId(personaId: number) {
    const result = await query(
      `SELECT a.*
       FROM archivos a INNER JOIN tipos_archivo ta ON a.tipo_archivo_id = ta.tipo_archivo_id
       LEFT JOIN personas p ON a.persona_id = p.persona_id
       WHERE a.persona_id = $1 AND ta.nombre = 'photo' AND a.activo = true
       ORDER BY a.fecha_carga DESC LIMIT 1`,
      [personaId]
    )
    return result.rows[0]
  }



  static async create(data: Omit<ArchivosCreationAttributes, "archivo_id" | "fecha_carga" | "activo">, client?: any) {
    const result = await query(
      `INSERT INTO archivos (persona_id, tipo_archivo_id, nombre, url_archivo, descripcion, asignado_por, fecha_carga, activo)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), true) RETURNING *`,
      [data.persona_id, data.tipo_archivo_id, data.nombre, data.url_archivo, data.descripcion, data.asignado_por],
      client
    )
    return result.rows[0]
  }

  static async bulkCreate(data: Omit<ArchivosCreationAttributes, "archivo_id" | "fecha_carga" | "activo">[], client?: any) {
    if (data.length === 0) return []

    const fields = [
      "persona_id",
      "nombre",
      "descripcion",
      "tipo_archivo_id",
      "url_archivo",
      "asignado_por"
    ]

    const values: any[] = []
    const placeholders: string[] = []

    data.forEach((item, index) => {
      const baseIndex = index * fields.length

      placeholders.push(
        `(${fields.map((_, i) => `$${baseIndex + i + 1}`).join(", ")})`
      )

      values.push(
        item.persona_id,
        item.nombre,
        item.descripcion,
        item.tipo_archivo_id,
        item.url_archivo,
        item.asignado_por
      )
    })

    const result = await query(`
      INSERT INTO archivos (${fields.join(", ")})
      VALUES ${placeholders.join(", ")}
      RETURNING *`, values, client)

    return result.rows

  }

  static async update(id: number, data: Partial<ArchivosCreationAttributes>, client?: any) {
    const fields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "archivo_id" && key !== "fecha_carga" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE archivos SET ${fields.join(", ")} WHERE archivo_id = $${paramCount} RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  static async softDelete(id: number){
    const result = await query(
      `UPDATE archivos SET activo = false WHETE archivo_id = $1 RETURNING *`,
      [id]
    )
    
  }
  static async delete(id: number) {
    const result = await query("DELETE FROM archivos WHERE archivo_id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async count() {
    const result = await query("SELECT COUNT(*) FROM archivos")
    return Number.parseInt(result.rows[0].count)
  }

  static async countByPersona(personaId: number) {
    const result = await query("SELECT COUNT(*) FROM archivos WHERE persona_id = $1", [personaId])
    return Number.parseInt(result.rows[0].count)
  }
}
