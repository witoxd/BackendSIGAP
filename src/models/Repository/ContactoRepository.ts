import { query } from "../../config/database"
import type { ContactoCreationAttributes } from "../sequelize/Contacto"

export class ContactoRepository {
  /**
   * Buscar contacto por ID
   */
  static async findById(id: number) {
    const result = await query(
      `SELECT 
      contacto_id,
      persona_id,
      tipo_contacto,
      valor,
      es_principal
       FROM contactos c
       WHERE c.contacto_id = $1 AND activo = true`,
      [id]
    )
    return result.rows[0]
  }

  /**
   * Obtener todos los contactos de una persona
   */
  static async findByPersonaId(personaId: number) {
    const result = await query(
      `SELECT 
      contacto_id,
      persona_id,
      tipo_contacto,
      valor,
      es_principal
       FROM contactos 
       WHERE persona_id = $1 AND activo = true
       ORDER BY es_principal DESC, contacto_id`,
      [personaId]
    )
    return result.rows
  }

  /**
   * Obtener contactos por tipo
   */
  static async findByTipo(personaId: number, tipoContacto: string) {
    const result = await query(
      `SELECT * FROM contactos 
       WHERE persona_id = $1 AND tipo_contacto = $2 AND activo = true
       ORDER BY es_principal DESC`,
      [personaId, tipoContacto]
    )
    return result.rows
  }

  /**
   * Crear un nuevo contacto
   */
  static async create(
    data: Omit<ContactoCreationAttributes, "contacto_id">,
    client?: any
  ) {
    const result = await query(
      `INSERT INTO contactos (persona_id, tipo_contacto, valor, es_principal, activo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        data.persona_id,
        data.tipo_contacto,
        data.valor,
        data.es_principal ?? false,
        data.activo ?? true,
      ],
      client
    )
    return result.rows[0]
  }

  /**
   * Crear múltiples contactos
   */
  static async bulkCreate(
    data: Omit<ContactoCreationAttributes, "contacto_id">[],
    client?: any
  ) {
    if (data.length === 0) return []

    const fields = ["persona_id", "tipo_contacto", "valor", "es_principal", "activo"]
    const values: any[] = []
    const placeholders: string[] = []

    data.forEach((item, index) => {
      const baseIndex = index * fields.length
      placeholders.push(
        `(${fields.map((_, i) => `$${baseIndex + i + 1}`).join(", ")})`
      )
      values.push(
        item.persona_id,
        item.tipo_contacto,
        item.valor,
        item.es_principal ?? false,
        item.activo ?? true
      )
    })

    const result = await query(
      `INSERT INTO contactos (${fields.join(", ")})
       VALUES ${placeholders.join(", ")}
       RETURNING *`,
      values,
      client
    )
    return result.rows
  }

  /**
   * Actualizar un contacto
   */
  static async update(
    id: number,
    data: Partial<ContactoCreationAttributes>,
    client?: any
  ) {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "contacto_id" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query(
      `UPDATE contactos 
       SET ${fields.join(", ")} 
       WHERE contacto_id = $${paramCount} 
       RETURNING *`,
      values,
      client
    )
    return result.rows[0]
  }

  /**
   * Eliminar (soft delete) un contacto
   */
  static async delete(id: number, client?: any) {
    const result = await query(
      `UPDATE contactos SET activo = false 
       WHERE contacto_id = $1 
       RETURNING *`,
      [id],
      client
    )
    return result.rows[0]
  }

  /**
   * Eliminar permanentemente un contacto
   */
  static async hardDelete(id: number, client?: any) {
    const result = await query(
      `DELETE FROM contactos 
       WHERE contacto_id = $1 
       RETURNING *`,
      [id],
      client
    )
    return result.rows[0]
  }

  /**
   * Establecer un contacto como principal y quitar principal de los demás
   */
  static async setPrincipal(contactoId: number, personaId: number, client?: any) {
    // Quitar principal de todos los contactos de la persona
    await query(
      `UPDATE contactos SET es_principal = false WHERE persona_id = $1`,
      [personaId],
      client
    )

    // Establecer el nuevo principal — solo si el contacto pertenece a la persona
    const result = await query(
      `UPDATE contactos SET es_principal = true
       WHERE contacto_id = $1 AND persona_id = $2
       RETURNING *`,
      [contactoId, personaId],
      client
    )
    return result.rows[0]
  }
}
