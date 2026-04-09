import { RoleType } from "../types";
import { UsuarioCreationAttributes } from "../models/sequelize/Usuario";
import { PersonaCreationAttributes } from "../models/sequelize/Persona";
export declare class AuthService {
    personaExisting(personaID: number): Promise<void>;
    checkEmailAndUsername(email: string, username: string): Promise<void>;
    checkRoleExists(roleName: string): Promise<any>;
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
    createUser(user: UsuarioCreationAttributes, personaID: number, role: RoleType, client?: any): Promise<{
        message: string;
        data: {
            userId: any;
            personaId: any;
            role: RoleType;
        };
    }>;
    createUserWithPersona(user: UsuarioCreationAttributes, persona: PersonaCreationAttributes, role: RoleType): Promise<{
        message: string;
        data: any;
    }>;
    resetPasswordByDefaultDocument(personaId: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map