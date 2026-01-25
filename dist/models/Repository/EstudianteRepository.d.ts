import type { EstudianteCreationAttributes } from "../sequelize/Estudiante";
export declare class EstudianteRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByPersonaId(personaId: number): Promise<any>;
    static create(data: Omit<EstudianteCreationAttributes, "estudiante_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<EstudianteCreationAttributes>, client?: any): Promise<any>;
    static findByDocumento(numero_documento: string): Promise<any>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
}
//# sourceMappingURL=EstudianteRepository.d.ts.map