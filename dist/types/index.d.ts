import { PersonaCreationAttributes } from "../models/sequelize/Persona";
import { EstudianteCreationAttributes } from "../models/sequelize/Estudiante";
import { ProfesorCreationAttributes } from "../models/sequelize/Profesor";
import { AdministrativoCreationAttributes } from "../models/sequelize/Administrativo";
import { AcudienteCreationAttributes } from "../models/sequelize/Acudiente";
import { CursoCreationAttributes } from "../models/sequelize/Curso";
import { JornadaCreationAttributes } from "../models/sequelize/Jornada";
import { MatriculaCreationAttributes } from "../models/sequelize/Matricula";
import { EgresadoCreationAttributes } from "../models/sequelize/Egresado";
import { TipoDocumentoCreationAttributes } from "../models/sequelize/TipoDocumento";
import { AcudienteEstudianteCreationAttributes } from "../models/sequelize/AcudienteEstudiante";
import { ArchivosCreationAttributes } from "../models/sequelize/Archivo";
import { ContactoCreationAttributes } from "../models/sequelize/Contacto";
import { TipoArchivoCreationAttributes } from "../models/sequelize/TipoArchivo";
export interface CreateContactoDTO {
    contacto: ContactoCreationAttributes;
}
export interface UpdateContactoDTO {
    contacto: Partial<ContactoCreationAttributes>;
}
export interface BulkCreateContactoDTO {
    contactos: ContactoCreationAttributes[];
}
export interface CreateArchivoDTO {
    archivo: ArchivosCreationAttributes;
}
export interface UpdateArchivoDTO {
    archivo: Partial<ArchivosCreationAttributes>;
}
export interface CreateTipoArchivoDTO {
    tipo_archivo: TipoArchivoCreationAttributes;
}
export interface UpdateTipoArchivoDTO {
    tipo_archivo: Partial<TipoArchivoCreationAttributes>;
}
export declare enum ContextoArchivo {
    estudiante = "estudiante",
    profesor = "profesor",
    administrativo = "administrativo",
    acudiente = "acudiente"
}
export type { ContactoCreationAttributes, TipoArchivoCreationAttributes, };
export interface CreateAssingAdministrativoDTO {
    administrativo: AdministrativoCreationAttributes;
}
export interface CreateAdministrativoDTO {
    administrativo: AdministrativoCreationAttributes;
    persona: PersonaCreationAttributes;
}
export interface UpdateAdministrativoDTO {
    administrativo: Partial<Omit<AdministrativoCreationAttributes, "administrador_id">>;
    persona: Partial<PersonaCreationAttributes>;
}
export interface CreateAssingAcudienteDTO {
    acudiente: AcudienteCreationAttributes;
}
export interface CreateAcudianteDTO {
    acudiente: AcudienteCreationAttributes;
    persona: PersonaCreationAttributes;
}
export interface UpdateAcudianteDTO {
    acudiente: Partial<AcudienteCreationAttributes>;
    persona: Partial<PersonaCreationAttributes>;
}
export interface assignToEstudiante {
    assignToEstudiante: AcudienteEstudianteCreationAttributes;
}
export interface CreateAssingProfesorDTO {
    profesor: ProfesorCreationAttributes;
}
export interface CreateProfesorDTO {
    profesor: ProfesorCreationAttributes;
    persona: PersonaCreationAttributes;
}
export interface UpdateProfesorDTO {
    profesor: Partial<Omit<ProfesorCreationAttributes, "profesor_id" | "persona_id">>;
    persona?: Partial<PersonaCreationAttributes>;
}
export interface CreateTipoDocumentoDTO {
    tipo_documento: TipoDocumentoCreationAttributes;
}
export interface UpdateTipoDocumentoDTO {
    tipo_documento: Partial<TipoDocumentoCreationAttributes>;
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
export interface UpdateJornadDTO {
    jornada: Partial<JornadaCreationAttributes>;
}
export interface CreatePersonaDTO {
    persona: PersonaCreationAttributes;
}
export interface UpdatePersonaDTO {
    persona: Partial<PersonaCreationAttributes>;
}
export interface CreateCursoDTO {
    curso: CursoCreationAttributes;
}
export interface updateCursoDTO {
    curso: Partial<CursoCreationAttributes>;
}
export interface CreateMatriculaDTO {
    matricula: MatriculaCreationAttributes;
}
export interface UpdateMatriculaDTO {
    matricula: Partial<MatriculaCreationAttributes>;
}
export interface UpdateEstudianteDTO {
    persona?: Partial<PersonaCreationAttributes>;
    estudiante?: Partial<EstudianteCreationAttributes>;
}
export interface CreateEstudianteDTO {
    estudiante: EstudianteCreationAttributes;
    persona: PersonaCreationAttributes;
}
export interface UpsertFichaDTO {
    ficha: {
        numero_hermanos?: number;
        posicion_hermanos?: number;
        nombre_hermano_mayor?: string;
        parientes_hogar?: string;
        total_parientes?: number;
        motivo_traslado?: string;
        limitaciones_fisicas?: string;
        otras_limitaciones?: string;
        talentos_especiales?: string;
        otras_actividades?: string;
        eps_ars?: string;
        alergia?: string;
        centro_atencion_medica?: string;
        medio_transporte?: string;
        transporte_propio?: boolean;
        observaciones?: string;
    };
}
export interface CreateColegioDTO {
    colegio: {
        nombre_colegio: string;
        ciudad?: string;
        grado_cursado?: string;
        anio?: number;
    };
}
export interface UpdateColegioDTO {
    colegio: {
        nombre_colegio?: string;
        ciudad?: string;
        grado_cursado?: string;
        anio?: number;
        orden?: number;
    };
}
export interface ReplaceColegiosDTO {
    colegios: Array<{
        nombre_colegio: string;
        ciudad?: string;
        grado_cursado?: string;
        anio?: number;
    }>;
}
export interface UpsertViviendaDTO {
    vivienda: {
        tipo_paredes?: string;
        tipo_techo?: string;
        tipo_pisos?: string;
        num_banos?: number;
        num_cuartos?: number;
    };
}
export interface UpsertExpedienteDTO {
    ficha?: UpsertFichaDTO["ficha"];
    colegios?: ReplaceColegiosDTO["colegios"];
    vivienda?: UpsertViviendaDTO["vivienda"];
}
export interface RoleRow {
    nombre: string;
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
import { PeriodoMatriculaCreationAttributes } from "../models/sequelize/PeriodoMatricula";
export interface CreatePeriodoMatriculaDTO {
    periodo: Omit<PeriodoMatriculaCreationAttributes, "periodo_id" | "activo" | "created_by" | "created_at">;
}
export interface UpdatePeriodoMatriculaDTO {
    periodo: Partial<Omit<PeriodoMatriculaCreationAttributes, "periodo_id" | "activo" | "created_by" | "created_at">>;
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
    JORNADAS = "jornadas",
    EXPEDIENTE = "expedientes"
}
//# sourceMappingURL=index.d.ts.map