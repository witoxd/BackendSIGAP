import { Model, type Optional } from "sequelize";
interface MatriculaAttributes {
    matricula_id: number;
    estudiante_id: number;
    curso_id: number;
    jornada_id: number;
    periodo_id: number;
    fecha_matricula: Date;
    estado: "activa" | "finalizada" | "retirada";
    fecha_retiro?: Date;
    motivo_retiro?: string;
    url_firma_alumno?: string;
    url_firma_acudiente?: string;
}
export interface MatriculaCreationAttributes extends Optional<MatriculaAttributes, "matricula_id" | "fecha_matricula" | "fecha_retiro" | "motivo_retiro" | "url_firma_alumno" | "url_firma_acudiente"> {
}
export declare class Matricula extends Model<MatriculaAttributes, MatriculaCreationAttributes> implements MatriculaAttributes {
    matricula_id: number;
    estudiante_id: number;
    curso_id: number;
    jornada_id: number;
    fecha_matricula: Date;
    periodo_id: number;
    estado: "activa" | "finalizada" | "retirada";
    fecha_retiro?: Date;
    motivo_retiro?: string;
    url_firma_alumno?: string;
    url_firma_acudiente?: string;
}
export {};
//# sourceMappingURL=Matricula.d.ts.map