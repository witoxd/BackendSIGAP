import type { SedeCreationAttributes } from "../sequelize/Sede";
export declare class SedeRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByNombre(nombre: string): Promise<any>;
    static create(data: Omit<SedeCreationAttributes, "sede_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<SedeCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
}
//# sourceMappingURL=SedeRepository.d.ts.map