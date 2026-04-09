import { AdministrativoCreationAttributes } from "../sequelize/Administrativo";
export declare class AdministrativoRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByPersonaId(personaId: number): Promise<any>;
    static SearchIndex(index: string, limit?: number): Promise<any>;
    static create(data: Omit<AdministrativoCreationAttributes, "administrativo_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<AdministrativoCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
}
//# sourceMappingURL=AdministrativoRepository.d.ts.map