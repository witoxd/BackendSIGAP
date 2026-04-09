import type { ColegioAnteriorCreationAttributes } from "../sequelize/ColegioAnterior";
export declare class ColegioAnteriorRepository {
    static findByEstudianteId(estudianteId: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static create(data: Omit<ColegioAnteriorCreationAttributes, "colegio_ant_id">, client?: any): Promise<any>;
    static replaceAll(estudianteId: number, colegios: Omit<ColegioAnteriorCreationAttributes, "colegio_ant_id" | "estudiante_id" | "orden">[], client?: any): Promise<any[]>;
    static update(id: number, data: Partial<Omit<ColegioAnteriorCreationAttributes, "colegio_ant_id" | "estudiante_id">>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static deleteByEstudianteId(estudianteId: number): Promise<void>;
    private static nextOrden;
}
//# sourceMappingURL=ColegioAnteriorRepository.d.ts.map