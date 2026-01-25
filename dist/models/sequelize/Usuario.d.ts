import { Model, type Optional } from "sequelize";
interface UsuarioAttributes {
    usuario_id: number;
    persona_id: number;
    username: string;
    email: string;
    contraseña: string;
    activo: boolean;
    fecha_creacion: Date;
}
export interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, "usuario_id" | "activo" | "fecha_creacion"> {
}
export declare class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
    usuario_id: number;
    persona_id: number;
    username: string;
    email: string;
    contraseña: string;
    activo: boolean;
    fecha_creacion: Date;
    verifyPassword(password: string): Promise<boolean>;
}
export {};
//# sourceMappingURL=Usuario.d.ts.map