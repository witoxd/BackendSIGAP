import { Model, type Optional } from "sequelize";
interface EgresadoAttributes {
    egresado_id: number;
    estudiante_id: number;
    fecha_grado?: Date;
}
export interface EgresadoCreationAttributes extends Optional<EgresadoAttributes, "egresado_id"> {
}
export declare class Egresado extends Model<EgresadoAttributes, EgresadoCreationAttributes> implements EgresadoAttributes {
    egresado_id: number;
    estudiante_id: number;
    fecha_grado?: Date;
}
export {};
//# sourceMappingURL=Egresado.d.ts.map