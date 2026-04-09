import type { PeriodoMatriculaCreationAttributes } from "../sequelize/PeriodoMatricula";
export declare class PeriodoMatriculaRepository {
    static findActivo(): Promise<any>;
    static findAll(): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByAnio(anio: number): Promise<any>;
    static create(data: Omit<PeriodoMatriculaCreationAttributes, "periodo_id">, client?: any): Promise<any>;
    static activar(id: number, client?: any): Promise<any>;
    static desactivar(id: number, client?: any): Promise<any>;
    static update(id: number, data: Partial<Omit<PeriodoMatriculaCreationAttributes, "periodo_id">>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
    static tieneMatriculas(id: number): Promise<boolean>;
}
//# sourceMappingURL=PeriodoMatriculaRepository.d.ts.map