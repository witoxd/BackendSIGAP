import { EgresadoCreationAttributes } from "../sequelize/Egresado";
export declare class EgresadoRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByEstudianteId(estudianteId: number): Promise<any>;
    static findByYear(year: number): Promise<any>;
    static create(data: Omit<EgresadoCreationAttributes, "egresado_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<EgresadoCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
}
//# sourceMappingURL=EgresadoRepository.d.ts.map