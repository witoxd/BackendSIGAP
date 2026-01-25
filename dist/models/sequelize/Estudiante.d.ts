import { Model, type Optional } from "sequelize";
interface EstudianteAttributes {
    estudiante_id: number;
    persona_id: number;
    jornada_id: number;
    sede_id: number;
    estado: "activo" | "inactivo" | "graduado" | "suspendido" | "expulsado";
    fecha_ingreso: Date;
}
export interface EstudianteCreationAttributes extends Optional<EstudianteAttributes, "estudiante_id" | "jornada_id" | "estado"> {
}
export declare class Estudiante extends Model<EstudianteAttributes, EstudianteCreationAttributes> implements EstudianteAttributes {
    estudiante_id: number;
    persona_id: number;
    jornada_id: number;
    sede_id: number;
    estado: "activo" | "inactivo" | "graduado" | "suspendido" | "expulsado";
    fecha_ingreso: Date;
}
export {};
//# sourceMappingURL=Estudiante.d.ts.map