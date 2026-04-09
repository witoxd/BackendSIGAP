import type { PersonaCreationAttributes, PersonaAttributes } from "../../models/sequelize/Persona";
export declare class PersonaRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByDocumento(numero_documento: string, client?: any): Promise<any>;
    static existingPersonaByDocumento(numero_documento: string, client?: any): Promise<PersonaAttributes>;
    static searchByDocumento(numero_documento: string): Promise<any>;
    static SearchIndex(index: string, limit?: number): Promise<any>;
    static create(data: Omit<PersonaCreationAttributes, "persona_id">, client?: any): Promise<PersonaAttributes>;
    static update(id: number, data: Partial<PersonaCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
    static getOrCreatePersona(personaData: PersonaCreationAttributes, client?: any): Promise<any>;
    static tieneRol(personaId: number, rol: string): Promise<boolean>;
    static getRoles(personaId: number): Promise<string[]>;
    static personaPuedeSubirArchivo(personaId: number, tipoArchivoId: number): Promise<boolean>;
}
//# sourceMappingURL=PersonaRepository.d.ts.map