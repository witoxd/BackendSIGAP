import type { UsuarioCreationAttributes } from "../sequelize/Usuario";
export declare class UserRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByEmail(email: string): Promise<any>;
    static findByUsername(username: string): Promise<any>;
    static create(data: Omit<UsuarioCreationAttributes, "usuario_id" | "fecha_creacion" | "activo">, client?: any): Promise<any>;
    static updatePassword(id: number, newPassword: string): Promise<any>;
    static toggleActive(id: number, activo: boolean): Promise<any>;
    static verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    static assignRole(userId: number, roleId: number, client?: any): Promise<any>;
    static removeRole(userId: number, roleId: number): Promise<any>;
    static count(): Promise<number>;
}
//# sourceMappingURL=UserRepository.d.ts.map