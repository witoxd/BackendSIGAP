import { query } from "../../config/database"
import type { TipoArchivoCreationAttributes } from "../sequelize/TipoArchivo"

export class TipoArchivoRepository {
  /**
   * Obtener todos los tipos de archivo
   */
  static async findAll() {
    const result = await query(
      "SELECT * FROM tipos_archivo WHERE activo = true ORDER BY nombre"
    )
    return result.rows
  }

  static async countByTipo(id: number){

    const result = await query(
    "SELECT COUNT(*) FROM archivos WHERE tipo_archivo_id = $1",
     [id]
    )
    return result.rows
  }

  /**
   * Buscar tipo de archivo por ID
   */
  static async findById(id: number) {
    const result = await query(
      "SELECT * FROM tipos_archivo WHERE tipo_archivo_id = $1",
      [id]
    )
    return result.rows[0]
  }

  /**
   * Buscar tipo de archivo por nombre
   */
  static async findByNombre(nombre: string) {
    const result = await query(
      "SELECT * FROM tipos_archivo WHERE nombre = $1",
      [nombre]
    )
    return result.rows[0]
  }

  /**
   * Crear un nuevo tipo de archivo
   */
  static async create(
    data: Omit<TipoArchivoCreationAttributes, "tipo_archivo_id">,
    client?: any
  ) {
    const result = await query(
      `INSERT INTO tipos_archivo (nombre, descripcion, extensiones_permitidas, activo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        data.nombre,
        data.descripcion || null,
        data.extensiones_permitidas || null,
        data.activo ?? true,
      ],
      client
    )
    return result.rows[0]
  }

  /**
   * Actualizar un tipo de archivo
   */
  static async update(
    id: number,
    data: Partial<TipoArchivoCreationAttributes>,
    client?: any
  ) {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "tipo_archivo_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE tipos_archivo 
       SET ${fields.join(", ")} 
       WHERE tipo_archivo_id = $${paramCount} 
       RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  /**
   * Eliminar (soft delete) un tipo de archivo
   */
  static async delete(id: number, client?: any) {
    const result = await query(
      `UPDATE tipos_archivo SET activo = false 
       WHERE tipo_archivo_id = $1 
       RETURNING *`,
      [id],
      client
    )
    return result.rows[0]
  }

  /**
   * Eliminar permanentemente un tipo de archivo
   */
  static async hardDelete(id: number, client?: any) {
    const result = await query(
      `DELETE FROM tipos_archivo 
       WHERE tipo_archivo_id = $1 
       RETURNING *`,
      [id],
      client
    )
    return result.rows[0]
  }

  /**
   * SoftDelete un tipo de archivo
   */

  static async softDelete(id: number, client?: any) {
    const result = await query(
      `UPDATE tipos_archivo SET activo = false 
       WHERE tipo_archivo_id = $1 
       RETURNING *`,
      [id],
      client
    )
    return result.rows[0]
  }

  /**
   * Contar tipos de archivo
   */
  static async count() {
    const result = await query(
      "SELECT COUNT(*) FROM tipos_archivo WHERE activo = true"
    )
    return Number.parseInt(result.rows[0].count)
  }

  /**
   * Verificar si una extensión es permitida para un tipo de archivo
   */
  static async isExtensionAllowed(tipoArchivoId: number, extension: string): Promise<boolean> {
    const result = await query(
      `SELECT extensiones_permitidas FROM tipos_archivo 
       WHERE tipo_archivo_id = $1`,
      [tipoArchivoId]
    )

    if (!result.rows[0]) return false

    const extensionesPermitidas = result.rows[0].extensiones_permitidas
    
    // Si no hay extensiones específicas, permitir todas
    if (!extensionesPermitidas || extensionesPermitidas.length === 0) {
      return true
    }

    // Verificar si la extensión está en la lista
    return extensionesPermitidas.includes(extension.toLowerCase())
  }

  static async findByRol(rol: string) {
  const result = await query(
    `SELECT * FROM tipos_archivo 
     WHERE activo = true 
     AND (aplica_a IS NULL OR $1 = ANY(aplica_a))
     ORDER BY nombre`,
    [rol]
  )
  return result.rows
}
}
