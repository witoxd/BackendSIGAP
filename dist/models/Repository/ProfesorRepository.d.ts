import { ProfesorCreationAttributes } from "../sequelize/Profesor";
export declare class ProfesorRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByPersonaId(personaId: number): Promise<any>;
    static create(data: Omit<ProfesorCreationAttributes, "profesor_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<ProfesorCreationAttributes>, client?: any): Promise<any>;
    static SearchIndex(index: string, limit?: number): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
}
//# sourceMappingURL=ProfesorRepository.d.ts.map