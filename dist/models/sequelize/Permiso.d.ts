import { Model, type Optional } from "sequelize";
interface PermisoAttributes {
    permiso_id: number;
    nombre: string;
    descripcion?: string;
    recurso: string;
    accion: string;
}
interface PermisoCreationAttributes extends Optional<PermisoAttributes, "permiso_id"> {
}
export declare class Permiso extends Model<PermisoAttributes, PermisoCreationAttributes> implements PermisoAttributes {
    permiso_id: number;
    nombre: string;
    descripcion?: string;
    recurso: string;
    accion: string;
}
export {};
//# sourceMappingURL=Permiso.d.ts.map