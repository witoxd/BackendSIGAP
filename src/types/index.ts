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

export enum ContextoArchivo  {
estudiante = "estudiante",
profesor = "profesor",
administrativo = "administrativo",
acudiente = "acudiente",
matricula = "matricula"
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

export interface AdministrativoPayload {
  // Campo propio del administrativo
  cargo?:              string
  // Campos del docente base
  sede?:               string
  jornada_id?:         number
  tipo_contrato?:      string
  estado?:             "activo" | "inactivo"
  fecha_contratacion?: Date | string
}

export interface CreateAssingAdministrativoDTO{
  administrativo: AdministrativoCreationAttributes
}

export interface CreateAdministrativoDTO {
  administrativo: AdministrativoPayload
  persona: PersonaCreationAttributes
}

export interface UpdateAdministrativoDTO{
   administrativo: AdministrativoPayload
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

export interface CreateAssingProfesorDTO {
  profesor: ProfesorCreationAttributes
}

// Payload plano que el controller distribuye entre docente + profesores
export interface ProfesorPayload {
  // Campos que van a docente (contratación)
  sede?:              string
  jornada_id?:        number
  tipo_contrato?:     string
  estado?:            "activo" | "inactivo"
  fecha_contratacion?: Date | string
  // Campos académicos (van a docente)
  decreto_id?:          number
  fecha_nombramiento?:  Date | string
  numero_resolucion?:   string
  grado_escalafon_id?:  number
  area?:                string
  titulo?:              string
  posgrado?:            string
  perfil_profesional?:  string
}

export interface CreateProfesorDTO {
  profesor: ProfesorPayload
  persona: PersonaCreationAttributes
  contactos: Omit<ContactoCreationAttributes, "contacto_id" | "persona_id">[]
  contacto_emergencia: {
    nombre: string
    parentesco: string
    telefono: string
    celular?: string | null
  }
}

export interface UpdateProfesorDTO {
  profesor?: ProfesorPayload
  persona?:  Partial<PersonaCreationAttributes>
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
//  FICHA ESTUDIANTE TYPES
// ============================================================================

export interface UpsertFichaDTO {
  ficha: {
    numero_hermanos?:     number
    posicion_hermanos?:   number
    nombre_hermano_mayor?: string
    parientes_hogar?:     string
    total_parientes?:     number
    motivo_traslado?:     string
    limitaciones_fisicas?: string
    otras_limitaciones?:  string
    talentos_especiales?: string
    otras_actividades?:   string
    eps_ars?:             string
    alergia?:             string
    centro_atencion_medica?: string
    medio_transporte?:    string
    transporte_propio?:   boolean
    observaciones?:       string
  }
}

export interface CreateColegioDTO {
  colegio: {
    nombre_colegio: string
    ciudad?:        string
    grado_cursado?: string
    anio?:          number
  }
}

export interface UpdateColegioDTO {
  colegio: {
    nombre_colegio?: string
    ciudad?:         string
    grado_cursado?:  string
    anio?:           number
    orden?:          number
  }
}

export interface ReplaceColegiosDTO {
  colegios: Array<{
    nombre_colegio: string
    ciudad?:        string
    grado_cursado?: string
    anio?:          number
  }>
}

export interface UpsertViviendaDTO {
  vivienda: {
    tipo_paredes?: string
    tipo_techo?:   string
    tipo_pisos?:   string
    num_banos?:    number
    num_cuartos?:  number
  }
}

export interface UpsertExpedienteDTO {
  ficha?:    UpsertFichaDTO["ficha"]
  colegios?: ReplaceColegiosDTO["colegios"]
  vivienda?: UpsertViviendaDTO["vivienda"]
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
  username: string
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
//  PERIODO MATRICULA TYPES
// ============================================================================
 
import { PeriodoMatriculaCreationAttributes } from "../models/sequelize/PeriodoMatricula"
import { ProcesoInscripcionCreationAttributes } from "../models/sequelize/ProcesoInscripcion"

export interface CreatePeriodoMatriculaDTO {
  periodo: Omit<PeriodoMatriculaCreationAttributes, "periodo_id" | "activo" | "created_by" | "created_at">
}

export interface UpdatePeriodoMatriculaDTO {
  periodo: Partial<Omit<PeriodoMatriculaCreationAttributes, "periodo_id" | "activo" | "created_by" | "created_at">>
}

export interface CreateProcesoInscripcionDTO {
  proceso: Omit<ProcesoInscripcionCreationAttributes, "proceso_id" | "activo" | "created_at">
}

export interface UpdateProcesoInscripcionDTO {
  proceso: Partial<Omit<ProcesoInscripcionCreationAttributes, "proceso_id" | "created_at">>
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
  EXPEDIENTE = "expedientes",
  DECRETOS = "decretos",
  GRADOS_ESCALAFON = "grados_escalafon",
}

// ============================================================================
//  DECRETO / GRADO ESCALAFON TYPES
// ============================================================================

export interface CreateDecretoDTO {
  decreto: { codigo: string; nombre: string; descripcion?: string }
}

export interface UpdateDecretoDTO {
  decreto: Partial<{ codigo: string; nombre: string; descripcion?: string }>
}

export interface CreateGradoEscalafonDTO {
  grado: { decreto_id: number; codigo: string; descripcion?: string; orden?: number }
}

export interface UpdateGradoEscalafonDTO {
  grado: Partial<{ decreto_id: number; codigo: string; descripcion?: string; orden: number }>
}
