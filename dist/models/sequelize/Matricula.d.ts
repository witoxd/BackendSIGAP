import { Model, type Optional } from "sequelize";
interface MatriculaAttributes {
    matricula_id: number;
    estudiante_id: number;
    profesor_id: number;
    curso_id: number;
    fecha_matricula: Date;
    estado: "activa" | "finalizada" | "retirada";
}
export interface MatriculaCreationAttributes extends Optional<MatriculaAttributes, "matricula_id" | "fecha_matricula"> {
}
export declare class Matricula extends Model<MatriculaAttributes, MatriculaCreationAttributes> implements MatriculaAttributes {
    matricula_id: number;
    estudiante_id: number;
    profesor_id: number;
    curso_id: number;
    fecha_matricula: Date;
    estado: "activa" | "finalizada" | "retirada";
}
export {};
//# sourceMappingURL=Matricula.d.ts.map