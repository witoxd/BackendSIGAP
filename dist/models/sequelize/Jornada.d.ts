import { Model, type Optional } from "sequelize";
interface JornadaAttributes {
    jornada_id: number;
    nombre: string;
    hora_inicio?: string;
    hora_fin?: string;
}
export interface JornadaCreationAttributes extends Optional<JornadaAttributes, "jornada_id"> {
}
export declare class Jornada extends Model<JornadaAttributes, JornadaCreationAttributes> implements JornadaAttributes {
    jornada_id: number;
    nombre: string;
    hora_inicio?: string;
    hora_fin?: string;
}
export {};
//# sourceMappingURL=Jornada.d.ts.map