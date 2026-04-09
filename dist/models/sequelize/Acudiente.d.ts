import { Model, type Optional } from "sequelize";
interface AcudienteAttributes {
    acudiente_id: number;
    persona_id: number;
    parentesco?: string;
    ocupacion?: string;
    nivel_estudio?: string;
}
export interface AcudienteCreationAttributes extends Optional<AcudienteAttributes, "acudiente_id" | "parentesco" | "ocupacion" | "nivel_estudio"> {
}
export declare class Acudiente extends Model<AcudienteAttributes, AcudienteCreationAttributes> implements AcudienteAttributes {
    acudiente_id: number;
    persona_id: number;
    parentesco?: string;
    ocupacion?: string;
    nivel_estudio?: string;
}
export {};
//# sourceMappingURL=Acudiente.d.ts.map