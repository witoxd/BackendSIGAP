import type { ViviendaEstudianteCreationAttributes } from "../sequelize/ViviendaEstudiante";
export declare class ViviendaEstudianteRepository {
    static findByEstudianteId(estudianteId: number): Promise<any>;
    static upsert(estudianteId: number, data: Partial<Omit<ViviendaEstudianteCreationAttributes, "vivienda_id" | "estudiante_id">>, client?: any): Promise<any>;
    static delete(estudianteId: number): Promise<any>;
}
//# sourceMappingURL=ViviendaEstudianteRepository.d.ts.map