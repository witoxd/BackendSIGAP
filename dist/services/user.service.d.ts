import type { PaginationParams, PaginatedResponse } from "../types";
export declare class UserService {
    getUserById(userId: number): Promise<any>;
    searchUsers(params: {
        query?: string;
        nombres?: string;
        numero_documento?: string;
        role?: string;
        pagination: PaginationParams;
    }): Promise<PaginatedResponse<any>>;
    assignAdminRole(targetUserId: number, adminUserId: number): Promise<{
        message: string;
    }>;
    transferAdminRole(fromUserId: number, toUserId: number): Promise<{
        message: string;
    }>;
    toggleUserStatus(userId: number, activo: boolean): Promise<{
        message: string;
    }>;
    createUser(): Promise<void>;
    resetPasswordUser(): Promise<void>;
    createUserWithPersona(): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map