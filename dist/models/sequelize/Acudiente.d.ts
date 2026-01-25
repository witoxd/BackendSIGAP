import { Model, type Optional } from "sequelize";
interface AcudienteAttributes {
    acudiente_id: number;
    persona_id: number;
    parentesco?: string;
}
export interface AcudienteCreationAttributes extends Optional<AcudienteAttributes, "acudiente_id"> {
}
export declare class Acudiente extends Model<AcudienteAttributes, AcudienteCreationAttributes> implements AcudienteAttributes {
    acudiente_id: number;
    persona_id: number;
    parentesco?: string;
}
export {};
//# sourceMappingURL=Acudiente.d.ts.map