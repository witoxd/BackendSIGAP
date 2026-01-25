import type { PersonaCreationAttributes } from "../../models/sequelize/Persona";
export declare class PersonaRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByDocumento(numero_documento: string): Promise<any>;
    static searchByDocumento(numero_documento: string): Promise<any>;
    static SearchIndex(index: string): Promise<any>;
    static create(data: Omit<PersonaCreationAttributes, "persona_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<PersonaCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
    static getOrCreatePersona(personaData: PersonaCreationAttributes, client?: any): Promise<any>;
}
//# sourceMappingURL=PersonaRepository.d.ts.map