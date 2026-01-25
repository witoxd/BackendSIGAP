export declare class AuthService {
    register(userData: {
        email: string;
        username: string;
        contraseña: string;
        nombres: string;
        apellido_paterno?: string;
        apellido_materno?: string;
        tipo_documento_id: number;
        numero_documento: string;
        fecha_nacimiento: string;
        genero?: string;
        role: string;
    }): Promise<any>;
    private createRoleSpecificRecord;
    login(email: string, contraseña: string): Promise<{
        token: string;
        user: {
            id: any;
            personaId: any;
            username: any;
            email: any;
            roles: any;
        };
    }>;
    private generateToken;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map