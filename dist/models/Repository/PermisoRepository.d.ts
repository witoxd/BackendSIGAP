import type { Permiso } from "../../types";
export declare class PermisoRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByRole(roleId: number): Promise<any>;
    static create(data: Omit<Permiso, "permiso_id">): Promise<any>;
    static assignToRole(roleId: number, permisoId: number): Promise<any>;
    static removeFromRole(roleId: number, permisoId: number): Promise<any>;
    static checkPermission(roleId: number, recurso: string, accion: string): Promise<boolean>;
}
//# sourceMappingURL=PermisoRepository.d.ts.map