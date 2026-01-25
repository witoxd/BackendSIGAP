import { CursoCreationAttributes } from "../sequelize/Curso";
export declare class CursoRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByGrado(grado: string): Promise<any>;
    static findByAño(año: number): Promise<any>;
    static findByProfesor(profesor_id: number): Promise<any>;
    static create(data: Omit<CursoCreationAttributes, "curso_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<CursoCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
}
//# sourceMappingURL=CursoRepository.d.ts.map