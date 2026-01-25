import { Model, type Optional } from "sequelize";
interface SedeAttributes {
    sede_id: number;
    nombre: string;
    direccion?: string;
}
export interface SedeCreationAttributes extends Optional<SedeAttributes, "sede_id"> {
}
export declare class Sede extends Model<SedeAttributes, SedeCreationAttributes> implements SedeAttributes {
    sede_id: number;
    nombre: string;
    direccion?: string;
}
export {};
//# sourceMappingURL=Sede.d.ts.map