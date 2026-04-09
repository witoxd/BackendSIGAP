import type { FichaEstudianteCreationAttributes } from "../sequelize/FichaEstudiante";
export declare class FichaEstudianteRepository {
    static findByEstudianteId(estudianteId: number): Promise<any>;
    static upsert(estudianteId: number, data: Partial<Omit<FichaEstudianteCreationAttributes, "ficha_id" | "estudiante_id">>, client?: any): Promise<any>;
    static delete(estudianteId: number): Promise<any>;
}
//# sourceMappingURL=FichaEstudianteRepository.d.ts.map