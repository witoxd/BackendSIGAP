import type { ContactoCreationAttributes } from "../sequelize/Contacto";
export declare class ContactoRepository {
    /**
     * Obtener todos los contactos con paginación
     */
    static findAll(limit?: number, offset?: number): Promise<any>;
    /**
     * Buscar contacto por ID
     */
    static findById(id: number): Promise<any>;
    /**
     * Obtener todos los contactos de una persona
     */
    static findByPersonaId(personaId: number): Promise<any>;
    /**
     * Obtener contactos por tipo
     */
    static findByTipo(personaId: number, tipoContacto: string): Promise<any>;
    /**
     * Obtener contacto principal de una persona
     */
    static findPrincipalByPersona(personaId: number): Promise<any>;
    /**
     * Crear un nuevo contacto
     */
    static create(data: Omit<ContactoCreationAttributes, "contacto_id">, client?: any): Promise<any>;
    /**
     * Crear múltiples contactos
     */
    static bulkCreate(data: Omit<ContactoCreationAttributes, "contacto_id">[], client?: any): Promise<any>;
    /**
     * Actualizar un contacto
     */
    static update(id: number, data: Partial<ContactoCreationAttributes>, client?: any): Promise<any>;
    /**
     * Eliminar (soft delete) un contacto
     */
    static delete(id: number, client?: any): Promise<any>;
    /**
     * Eliminar permanentemente un contacto
     */
    static hardDelete(id: number, client?: any): Promise<any>;
    /**
     * Contar contactos totales
     */
    static count(): Promise<number>;
    /**
     * Contar contactos por persona
     */
    static countByPersona(personaId: number): Promise<number>;
    /**
     * Establecer un contacto como principal y quitar principal de los demás
     */
    static setPrincipal(contactoId: number, personaId: number, client?: any): Promise<any>;
}
//# sourceMappingURL=ContactoRepository.d.ts.map