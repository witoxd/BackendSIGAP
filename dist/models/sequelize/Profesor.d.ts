import { Model, type Optional } from "sequelize";
interface ProfesorAttributes {
    profesor_id: number;
    persona_id: number;
    sede_id: number;
    fecha_contratacion: Date;
    estado: "activo" | "inactivo";
}
export interface ProfesorCreationAttributes extends Optional<ProfesorAttributes, "profesor_id" | "estado"> {
}
export declare class Profesor extends Model<ProfesorAttributes, ProfesorCreationAttributes> implements ProfesorAttributes {
    profesor_id: number;
    persona_id: number;
    sede_id: number;
    fecha_contratacion: Date;
    estado: "activo" | "inactivo";
}
export {};
//# sourceMappingURL=Profesor.d.ts.map