import type { MatriculaArchivoCreationAttributes } from "../sequelize/MatriculaArchivo";
export declare class MatriculaArchivoRepository {
    static findByMatricula(matriculaId: number): Promise<any>;
    static findArchivosRequeridos(matriculaId: number): Promise<any>;
    static asociar(data: Omit<MatriculaArchivoCreationAttributes, "id" | "fecha_asociacion">, client?: any): Promise<any>;
    static asociarBulk(matriculaId: number, archivoIds: number[], client?: any): Promise<any>;
    static desasociar(matriculaId: number, archivoId: number, client?: any): Promise<any>;
    static desasociarTodos(matriculaId: number, client?: any): Promise<void>;
    static count(matriculaId: number): Promise<number>;
}
//# sourceMappingURL=MatriculaArchivoRepository.d.ts.map