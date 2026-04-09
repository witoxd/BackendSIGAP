import { Model, type Optional } from "sequelize";
interface ViviendaEstudianteAttributes {
    vivienda_id: number;
    estudiante_id: number;
    tipo_paredes?: string;
    tipo_techo?: string;
    tipo_pisos?: string;
    num_banos?: number;
    num_cuartos?: number;
    updated_at?: Date;
}
export interface ViviendaEstudianteCreationAttributes extends Optional<ViviendaEstudianteAttributes, "vivienda_id" | "tipo_paredes" | "tipo_techo" | "tipo_pisos" | "num_banos" | "num_cuartos" | "updated_at"> {
}
export declare class ViviendaEstudiante extends Model<ViviendaEstudianteAttributes, ViviendaEstudianteCreationAttributes> implements ViviendaEstudianteAttributes {
    vivienda_id: number;
    estudiante_id: number;
    tipo_paredes?: string;
    tipo_techo?: string;
    tipo_pisos?: string;
    num_banos?: number;
    num_cuartos?: number;
    updated_at?: Date;
}
export {};
//# sourceMappingURL=ViviendaEstudiante.d.ts.map