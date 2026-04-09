import { Model, type Optional } from "sequelize";
interface PeriodoMatriculaAttributes {
    periodo_id: number;
    anio: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    activo: boolean;
    descripcion?: string;
    created_by?: number;
    created_at?: Date;
}
export interface PeriodoMatriculaCreationAttributes extends Optional<PeriodoMatriculaAttributes, "periodo_id" | "activo" | "descripcion" | "created_by" | "created_at"> {
}
export declare class PeriodoMatricula extends Model<PeriodoMatriculaAttributes, PeriodoMatriculaCreationAttributes> implements PeriodoMatriculaAttributes {
    periodo_id: number;
    anio: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    activo: boolean;
    descripcion?: string;
    created_by?: number;
    created_at?: Date;
}
export {};
//# sourceMappingURL=PeriodoMatricula.d.ts.map