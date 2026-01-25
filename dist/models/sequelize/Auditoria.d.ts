import { Model, type Optional } from "sequelize";
interface AuditoriaAttributes {
    auditoria_id: number;
    tabla_nombre: string;
    accion: string;
    usuario_id?: number;
    fecha?: Date;
    detalle?: object;
}
interface AuditoriaCreationAttributes extends Optional<AuditoriaAttributes, "auditoria_id"> {
}
export declare class Auditoria extends Model<AuditoriaAttributes, AuditoriaCreationAttributes> implements AuditoriaAttributes {
    auditoria_id: number;
    tabla_nombre: string;
    accion: string;
    usuario_id?: number;
    fecha?: Date;
    detalle?: object;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=Auditoria.d.ts.map