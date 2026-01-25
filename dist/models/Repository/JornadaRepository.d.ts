import type { JornadaCreationAttributes } from "../sequelize/Jornada";
export declare class JornadaRepository {
    static findAll(): Promise<any>;
    static findById(id: number): Promise<any>;
    static create(data: Omit<JornadaCreationAttributes, "jornada_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<JornadaCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
}
//# sourceMappingURL=JornadaRepository.d.ts.map