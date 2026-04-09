import { Model, type Optional } from "sequelize";
interface ColegioAnteriorAttributes {
    colegio_ant_id: number;
    estudiante_id: number;
    nombre_colegio: string;
    ciudad?: string;
    grado_cursado?: string;
    anio?: number;
    orden?: number;
}
export interface ColegioAnteriorCreationAttributes extends Optional<ColegioAnteriorAttributes, "colegio_ant_id" | "ciudad" | "grado_cursado" | "anio" | "orden"> {
}
export declare class ColegioAnterior extends Model<ColegioAnteriorAttributes, ColegioAnteriorCreationAttributes> implements ColegioAnteriorAttributes {
    colegio_ant_id: number;
    estudiante_id: number;
    nombre_colegio: string;
    ciudad?: string;
    grado_cursado?: string;
    anio?: number;
    orden?: number;
}
export {};
//# sourceMappingURL=ColegioAnterior.d.ts.map