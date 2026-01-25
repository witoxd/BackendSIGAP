import type { Role } from "../sequelize/Role";
export declare class RoleRepository {
    static findAll(): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByName(nombre: string): Promise<any>;
    static create(data: Omit<Role, "role_id">): Promise<any>;
    static update(id: number, data: Partial<Role>): Promise<any>;
    static delete(id: number): Promise<any>;
}
//# sourceMappingURL=RoleRepository.d.ts.map