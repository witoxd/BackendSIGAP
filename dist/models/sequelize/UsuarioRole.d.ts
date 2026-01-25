import { Model } from "sequelize";
interface UsuarioRoleAttributes {
    usuario_role_id: number;
    usuario_id: number;
    role_id: number;
    fecha_asignacion: Date;
}
export declare class UsuarioRole extends Model<UsuarioRoleAttributes> implements UsuarioRoleAttributes {
    usuario_role_id: number;
    usuario_id: number;
    role_id: number;
    fecha_asignacion: Date;
}
export {};
//# sourceMappingURL=UsuarioRole.d.ts.map