import { PersonaCreationAttributes } from "../models/sequelize/Persona";
import { EstudianteCreationAttributes } from "../models/sequelize/Estudiante";
import { ProfesorCreationAttributes } from "../models/sequelize/Profesor";
import { AdministrativoCreationAttributes } from "../models/sequelize/Administrativo";
import { AcudienteCreationAttributes } from "../models/sequelize/Acudiente";
import { CursoCreationAttributes } from "../models/sequelize/Curso";
import { JornadaCreationAttributes } from "../models/sequelize/Jornada";
import { MatriculaCreationAttributes } from "../models/sequelize/Matricula";
import { EgresadoCreationAttributes } from "../models/sequelize/Egresado";
import { SedeCreationAttributes } from "../models/sequelize/Sede";
import { TipoDocumentoCreationAttributes } from "../models/sequelize/TipoDocumento";
import { AcudienteEstudianteCreationAttributes } from "../models/sequelize/AcudienteEstudiante";
import { ArchivosCreationAttributes } from "../models/sequelize/Archivo";
export interface CreateAssingAcudienteDTO {
    acudiente: AcudienteCreationAttributes;
}
export interface CreateAssingProfesorDTO {
    profesor: ProfesorCreationAttributes;
}
export interface CreateAssingAdministrativoDTO {
    administrativo: AdministrativoCreationAttributes;
}
export interface CreateArchivoDTO {
    archivo: ArchivosCreationAttributes;
}
export interface UpdateArchivoDTO {
    archivo: Partial<ArchivosCreationAttributes>;
}
export interface CreateTipoDocumentoDTO {
    tipo_documento: TipoDocumentoCreationAttributes;
}
export interface UpdateTipoDocumentoDTO {
    tipo_documento: Partial<TipoDocumentoCreationAttributes>;
}
export interface CreateSedeDTO {
    sede: SedeCreationAttributes;
}
export interface UpdateSedeDTO {
    sede: Partial<SedeCreationAttributes>;
}
export interface CreateEgresadoDTO {
    egresado: EgresadoCreationAttributes;
}
export interface UpdateEgresadoDTO {
    egresado: Partial<EgresadoCreationAttributes>;
}
export interface CreateJornadaDTO {
    jornada: JornadaCreationAttributes;
}
export interface CreatePersonaDTO {
    persona: PersonaCreationAttributes;
}
export interface CreateAcudianteDTO {
    acudiente: AcudienteCreationAttributes;
    persona: PersonaCreationAttributes;
}
export interface CreateCursoDTO {
    curso: CursoCreationAttributes;
}
export interface CreateMatriculaDTO {
    matricula: MatriculaCreationAttributes;
}
export interface UpdateMatriculaDTO {
    matricula: Partial<MatriculaCreationAttributes>;
}
export interface UpdateJornadDTO {
    jornada: Partial<JornadaCreationAttributes>;
}
export interface updateCursoDTO {
    curso: Partial<CursoCreationAttributes>;
}
export interface UpdateAcudianteDTO {
    acudiente: Partial<AcudienteCreationAttributes>;
    persona: Partial<PersonaCreationAttributes>;
}
export interface assignToEstudiante {
    assignToEstudiante: AcudienteEstudianteCreationAttributes;
}
export interface RoleRow {
    nombre: string;
}
export interface CreateEstudianteDTO {
    estudiante: EstudianteCreationAttributes;
    persona: PersonaCreationAttributes;
}
export interface CreateProfesorDTO {
    profesor: ProfesorCreationAttributes;
    persona: PersonaCreationAttributes;
}
export interface CreateAdministrativoDTO {
    administrativo: AdministrativoCreationAttributes;
    persona: PersonaCreationAttributes;
}
export interface UpdateEstudianteDTO {
    persona?: Partial<PersonaCreationAttributes>;
    estudiante?: Partial<EstudianteCreationAttributes>;
}
export interface UpdateProfesorDTO {
    profesor: Partial<Omit<ProfesorCreationAttributes, "profesor_id" | "persona_id">>;
    persona?: Partial<PersonaCreationAttributes>;
}
export interface UpdateAdministrativoDTO {
    administrativo: Partial<Omit<AdministrativoCreationAttributes, "administrador_id">>;
    persona: Partial<PersonaCreationAttributes>;
}
export interface UpdatePersonaDTO {
    persona: Partial<PersonaCreationAttributes>;
}
export interface Role {
    role_id: number;
    nombre: string;
    descripcion?: string;
    activo?: boolean;
}
export declare enum RoleType {
    ADMIN = "admin",
    ESTUDIANTE = "estudiante",
    PROFESOR = "profesor",
    ADMINISTRATIVO = "administrativo"
}
export interface JwtPayload {
    userId: number;
    personaId: number;
    email: string;
    roles: string[];
}
export interface ApiError {
    message: string;
    statusCode: number;
    errors?: any[];
}
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface Permiso {
    permiso_id: number;
    nombre: string;
    descripcion?: string;
    recurso: string;
    accion: string;
}
export interface RolePermiso {
    role_permiso_id: number;
    role_id: number;
    permiso_id: number;
}
export interface ACLEntry {
    role: string;
    recurso: string;
    acciones: string[];
}
export declare enum Accion {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    MANAGE = "manage"
}
export declare enum Recurso {
    USUARIOS = "usuarios",
    PERSONAS = "personas",
    ESTUDIANTES = "estudiantes",
    PROFESORES = "profesores",
    ADMINISTRATIVOS = "administrativos",
    CURSOS = "cursos",
    MATRICULAS = "matriculas",
    DOCUMENTOS = "documentos",
    ASISTENCIAS = "asistencias",
    CALIFICACIONES = "calificaciones",
    ROLES = "roles",
    PERMISOS = "permisos",
    ACUDIENTES = "acudientes",
    SEDES = "sedes",
    JORNADAS = "jornadas"
}
//# sourceMappingURL=index.d.ts.map