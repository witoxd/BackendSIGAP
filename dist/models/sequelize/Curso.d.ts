import { Model, type Optional } from "sequelize";
interface CursoAttributes {
    curso_id: number;
    nombre: string;
    grado: string;
    descripcion?: string;
}
export interface CursoCreationAttributes extends Optional<CursoAttributes, "curso_id" | "descripcion" | "nombre"> {
}
export declare class Curso extends Model<CursoAttributes, CursoCreationAttributes> implements CursoAttributes {
    curso_id: number;
    nombre: string;
    descripcion?: string;
    grado: string;
}
export {};
//# sourceMappingURL=Curso.d.ts.map