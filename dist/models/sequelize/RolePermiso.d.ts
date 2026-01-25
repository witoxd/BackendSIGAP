import { Model, type Optional } from "sequelize";
interface RolePermisoAttributes {
    role_permiso_id: number;
    role_id: number;
    permiso_id: number;
}
interface RolePermisoCreationAttributes extends Optional<RolePermisoAttributes, "role_permiso_id"> {
}
export declare class RolePermiso extends Model<RolePermisoAttributes, RolePermisoCreationAttributes> implements RolePermisoAttributes {
    role_permiso_id: number;
    role_id: number;
    permiso_id: number;
}
export {};
//# sourceMappingURL=RolePermiso.d.ts.map