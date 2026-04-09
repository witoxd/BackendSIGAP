import { MatriculaCreationAttributes } from "../sequelize/Matricula";
export declare class MatriculaRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByEstudianteAndPeriodo(estudianteId: number, periodoId: number): Promise<any>;
    static findByEstudiante(estudianteId: number): Promise<any>;
    static create(data: Omit<MatriculaCreationAttributes, "matricula_id" | "anio_egreso">, client?: any): Promise<any>;
    static retirar(id: number, motivo?: string, client?: any): Promise<any>;
    static findActivas(limit?: number, offset?: number): Promise<any>;
    findAll(limit?: number, offset?: number): Promise<any>;
    static findByCurso(cursoId: number): Promise<any>;
    static update(id: number, Data: Partial<MatriculaCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
}
//# sourceMappingURL=MatriculaRepository.d.ts.map