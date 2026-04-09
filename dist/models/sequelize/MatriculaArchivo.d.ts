import { Model, type Optional } from "sequelize";
interface MatriculaArchivoAttributes {
    id: number;
    matricula_id: number;
    archivo_id: number;
    fecha_asociacion: Date;
}
export interface MatriculaArchivoCreationAttributes extends Optional<MatriculaArchivoAttributes, "id" | "fecha_asociacion"> {
}
export declare class MatriculaArchivo extends Model<MatriculaArchivoAttributes, MatriculaArchivoCreationAttributes> implements MatriculaArchivoAttributes {
    id: number;
    matricula_id: number;
    archivo_id: number;
    fecha_asociacion: Date;
}
export {};
//# sourceMappingURL=MatriculaArchivo.d.ts.map