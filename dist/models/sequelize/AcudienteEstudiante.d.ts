import { Model, type Optional } from "sequelize";
interface AcudienteEstudianteAttributes {
    acudiente_estudiante_id: number;
    estudiante_id: number;
    acudiente_id: number;
    tipo_relacion?: string;
    es_principal?: boolean;
}
export interface AcudienteEstudianteCreationAttributes extends Optional<AcudienteEstudianteAttributes, "acudiente_estudiante_id"> {
}
export declare class AcudienteEstudiante extends Model<AcudienteEstudianteAttributes, AcudienteEstudianteCreationAttributes> implements AcudienteEstudianteAttributes {
    acudiente_estudiante_id: number;
    estudiante_id: number;
    acudiente_id: number;
    tipo_relacion?: string;
    es_principal?: boolean;
}
export {};
//# sourceMappingURL=AcudienteEstudiante.d.ts.map