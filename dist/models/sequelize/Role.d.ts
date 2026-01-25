import { Model, type Optional } from "sequelize";
interface RoleAttributes {
    role_id: number;
    nombre: "admin" | "profesor" | "estudiante" | "administrativo";
    descripcion?: string;
}
interface RoleCreationAttributes extends Optional<RoleAttributes, "role_id" | "descripcion"> {
}
export declare class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    role_id: number;
    nombre: "admin" | "profesor" | "estudiante" | "administrativo";
    descripcion?: string;
}
export {};
//# sourceMappingURL=Role.d.ts.map