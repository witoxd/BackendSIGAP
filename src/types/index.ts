//Importacion de todos los modelos a usar 
import { PersonaCreationAttributes } from "../models/sequelize/Persona"
import { EstudianteCreationAttributes } from "../models/sequelize/Estudiante"
import { ProfesorCreationAttributes } from "../models/sequelize/Profesor"
import { AdministrativoCreationAttributes } from "../models/sequelize/Administrativo"
import { AcudienteCreationAttributes } from "../models/sequelize/Acudiente"
import { CursoCreationAttributes } from "../models/sequelize/Curso"
import { JornadaCreationAttributes } from "../models/sequelize/Jornada"
import { MatriculaCreationAttributes } from "../models/sequelize/Matricula"
import { EgresadoCreationAttributes } from "../models/sequelize/Egresado"
import { TipoDocumentoCreationAttributes } from "../models/sequelize/TipoDocumento"
import { AcudienteEstudianteCreationAttributes } from "../models/sequelize/AcudienteEstudiante"
import { ArchivosCreationAttributes } from "../models/sequelize/Archivo"
import { ContactoCreationAttributes } from "../models/sequelize/Contacto"
import { TipoArchivoCreationAttributes } from "../models/sequelize/TipoArchivo"

// ============================================================================
// CONTACTO TYPES
// ============================================================================

export interface CreateContactoDTO {
  contacto: ContactoCreationAttributes
}

export interface UpdateContactoDTO {
  contacto: Partial<ContactoCreationAttributes>
}

export interface BulkCreateContactoDTO {
  contactos: ContactoCreationAttributes[]
}

// ============================================================================
//  ARCHIVOS
// ============================================================================

export interface CreateArchivoDTO{
  archivo: ArchivosCreationAttributes
}

export interface UpdateArchivoDTO{
  archivo: Partial<ArchivosCreationAttributes>
}
// ============================================================================
// TIPO ARCHIVO TYPES
// ============================================================================

export interface CreateTipoArchivoDTO {
  tipo_archivo: TipoArchivoCreationAttributes
}

export interface UpdateTipoArchivoDTO {
  tipo_archivo: Partial<TipoArchivoCreationAttributes>
}

// ============================================================================
// NOTA: Los tipos de Archivo ya existen en el archivo original,
// solo necesitan actualizarse para usar tipo_archivo_id
// ============================================================================

// Exportar todo junto
export type {
  ContactoCreationAttributes,
  TipoArchivoCreationAttributes,
}

// ============================================================================
//  ADMINISTRATIVOS TYPES
// ============================================================================

export interface CreateAssingAdministrativoDTO{
  administrativo: AdministrativoCreationAttributes
}

export interface CreateAdministrativoDTO {
  administrativo: AdministrativoCreationAttributes
  persona: PersonaCreationAttributes
}

export interface UpdateAdministrativoDTO{
   administrativo: Partial<Omit<AdministrativoCreationAttributes, "administrador_id">> 
   persona: Partial<PersonaCreationAttributes>
}

// ============================================================================
//  ACUDIENTES TYPES
// ============================================================================

export interface CreateAssingAcudienteDTO{
  acudiente: AcudienteCreationAttributes
}

export interface CreateAcudianteDTO {
  acudiente: AcudienteCreationAttributes
  persona: PersonaCreationAttributes
}

export interface UpdateAcudianteDTO {
  acudiente: Partial<AcudienteCreationAttributes>
  persona: Partial<PersonaCreationAttributes>
}

//PAra asignar un estudiante a un acudiente
export interface assignToEstudiante{
  assignToEstudiante: AcudienteEstudianteCreationAttributes
}


// ============================================================================
//  PROFESOR TYPES
// ============================================================================

export interface CreateAssingProfesorDTO{
  profesor: ProfesorCreationAttributes
}

export interface CreateProfesorDTO {
  profesor: ProfesorCreationAttributes
  persona: PersonaCreationAttributes
}

export interface UpdateProfesorDTO{
  profesor: Partial<Omit<ProfesorCreationAttributes, "profesor_id" | "persona_id">> 
  persona?: Partial<PersonaCreationAttributes>
}



// ============================================================================
//  TIPO DOCUMENTO TYPES
// ============================================================================

export interface CreateTipoDocumentoDTO{
  tipo_documento: TipoDocumentoCreationAttributes
}

export interface UpdateTipoDocumentoDTO{
  tipo_documento: Partial<TipoDocumentoCreationAttributes>
}


// ============================================================================
//  EGRESADOS TYPES
// ============================================================================

export interface CreateEgresadoDTO {
  egresado: EgresadoCreationAttributes
}

export interface UpdateEgresadoDTO{
  egresado: Partial<EgresadoCreationAttributes>
}


// ============================================================================
//  JORNADA TYPES
// ============================================================================

export interface CreateJornadaDTO {
  jornada: JornadaCreationAttributes
}

export interface UpdateJornadDTO {
  jornada: Partial<JornadaCreationAttributes>
}

// ============================================================================
//  PERSONA TYPES
// ============================================================================

export interface CreatePersonaDTO { 
  persona: PersonaCreationAttributes
 }

 export interface UpdatePersonaDTO{
  persona: Partial<PersonaCreationAttributes>
}

// ============================================================================
//  CURSO TYPES
// ============================================================================

export interface CreateCursoDTO {
  curso: CursoCreationAttributes
}

export interface updateCursoDTO {
  curso: Partial<CursoCreationAttributes>
}

// ============================================================================
//  MATRICULA TYPES
// ============================================================================

export interface CreateMatriculaDTO {
  matricula: MatriculaCreationAttributes
}

export interface UpdateMatriculaDTO {
  matricula: Partial<MatriculaCreationAttributes>
}



// ============================================================================
//  ESTUDIANTE TYPES
// ============================================================================

export interface UpdateEstudianteDTO {
  persona?: Partial<PersonaCreationAttributes>
  estudiante?: Partial<EstudianteCreationAttributes>
}

export interface CreateEstudianteDTO {
  estudiante: EstudianteCreationAttributes
  persona: PersonaCreationAttributes
}


// ============================================================================
//  ROLES
// ============================================================================

export interface RoleRow {
  nombre: string
}

export interface Role {
  role_id: number
  nombre: string
  descripcion?: string
  activo?: boolean
}

export enum RoleType {
  ADMIN = "admin",
  ESTUDIANTE = "estudiante",
  PROFESOR = "profesor",
  ADMINISTRATIVO = "administrativo",
}


// ============================================================================
//  PARAMETRISACION
// ============================================================================

export interface JwtPayload {
  userId: number
  personaId: number
  email: string
  roles: string[]
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: any[]
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}


// ============================================================================
//  PERMISOS
// ============================================================================

export interface Permiso {
  permiso_id: number
  nombre: string
  descripcion?: string
  recurso: string
  accion: string
}

export interface RolePermiso {
  role_permiso_id: number
  role_id: number
  permiso_id: number
}

export interface ACLEntry {
  role: string
  recurso: string
  acciones: string[]
}


// ============================================================================
//  ACCIONES Y REUCURSOS
// ============================================================================

export enum Accion {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
}

export enum Recurso {
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
}
