import { AcudienteCreationAttributes } from "../sequelize/Acudiente";
import { AcudienteEstudianteCreationAttributes } from "../sequelize/AcudienteEstudiante";
export declare class AcudienteRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByPersonaId(personaId: number): Promise<any>;
    static findByEstudiante(estudianteId: number): Promise<any>;
    static create(data: Omit<AcudienteCreationAttributes, "acudiente_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<AcudienteCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
    static assignToEstudiante(data: Omit<AcudienteEstudianteCreationAttributes, "acudiente_estudiante_id">): Promise<any>;
    static removeFromEstudiante(estudianteId: number, acudienteId: number): Promise<any>;
}
//# sourceMappingURL=AcudienteRepository.d.ts.map