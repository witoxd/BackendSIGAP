import { sequelize } from "../../config/database"

// Modelos existentes
import { Persona } from "./Persona"
import { Usuario } from "./Usuario"
import { Role } from "./Role"
import { UsuarioRole } from "./UsuarioRole"
import { Estudiante } from "./Estudiante"
import { Profesor } from "./Profesor"
import { Administrativo } from "./Administrativo"
import { Curso } from "./Curso"
import { Matricula } from "./Matricula"
import { Jornada } from "./Jornada"
import { TipoDocumento } from "./TipoDocumento"
import { Archivos } from "./Archivo"
import { Permiso } from "./Permiso"
import { RolePermiso } from "./RolePermiso"
import { Egresado } from "./Egresado"
import { Acudiente } from "./Acudiente"
import { AcudienteEstudiante } from "./AcudienteEstudiante"
import { Auditoria } from "./Auditoria"
import { PeriodoMatricula } from "./PeriodoMatricula"
import { MatriculaArchivo } from "./MatriculaArchivo"
import { FichaEstudiante } from "./FichaEstudiante"
import { ColegioAnterior } from "./ColegioAnterior"
import { ViviendaEstudiante } from "./ViviendaEstudiante"
import { TipoArchivo } from "./TipoArchivo"
import { ReemplazoProfesor } from "./ReemplazoProfesor"
import { MatriculaHistorial } from "./MatriculaHistorial"

export const setupAssociations = () => {

  // ----------------------------------------------------------
  // Persona
  // ----------------------------------------------------------

  Persona.hasOne(Usuario, { foreignKey: "persona_id", as: "usuario" })
  Usuario.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  Persona.hasOne(Estudiante, { foreignKey: "persona_id", as: "estudiante" })
  Estudiante.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  Persona.hasOne(Profesor, { foreignKey: "persona_id", as: "profesor" })
  Profesor.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  Persona.hasOne(Administrativo, { foreignKey: "persona_id", as: "administrativo" })
  Administrativo.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  Persona.hasOne(Acudiente, { foreignKey: "persona_id", as: "acudiente" })
  Acudiente.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  Persona.hasMany(Archivos, { foreignKey: "persona_id", as: "archivos" })
  Archivos.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  // ----------------------------------------------------------
  // TipoDocumento
  // ----------------------------------------------------------

  // relacion de 1 a mcuhos entre los tippos de documento y las personas
  TipoDocumento.hasMany(Persona, { foreignKey: "tipo_documento_id", as: "personas" })
  Persona.belongsTo(TipoDocumento, { foreignKey: "tipo_documento_id", as: "tipo_documento" })

  // ----------------------------------------------------------
  // Roles y permisos
  // ----------------------------------------------------------

  // relacion de muchos a muchos para usuarios - roles
  Usuario.belongsToMany(Role, {
    through: UsuarioRole,
    foreignKey: "usuario_id",
    otherKey: "role_id",
    as: "roles",
  })

  // relacion de muchos a muchos para roles - usuarios 
  Role.belongsToMany(Usuario, {
    through: UsuarioRole,
    foreignKey: "role_id",
    otherKey: "usuario_id",
    as: "usuarios",
  })

  // relacion de muchos a muchos para roles - permisos
  Role.belongsToMany(Permiso, {
    through: RolePermiso,
    foreignKey: "role_id",
    otherKey: "permiso_id",
    as: "permisos",
  })
  // Relacion de muchos a muchos para permisos - roles
  Permiso.belongsToMany(Role, {
    through: RolePermiso,
    foreignKey: "permiso_id",
    otherKey: "role_id",
    as: "roles",
  })


  // ----------------------------------------------------------
  // Estudiante — núcleo del expediente
  // ----------------------------------------------------------

  // Matrícula (1:N) — un estudiante puede tener una matrícula por año
  Estudiante.hasMany(Matricula, { foreignKey: "estudiante_id", as: "matriculas" })
  Matricula.belongsTo(Estudiante, { foreignKey: "estudiante_id", as: "estudiante" })

  // Egresado (1:1)
  Estudiante.hasOne(Egresado, { foreignKey: "estudiante_id", as: "egresado" })
  Egresado.belongsTo(Estudiante, { foreignKey: "estudiante_id", as: "estudiante" })

  // Acudientes (N:M a través de AcudienteEstudiante)
  Estudiante.belongsToMany(Acudiente, {
    through: AcudienteEstudiante,
    foreignKey: "estudiante_id",
    otherKey: "acudiente_id",
    as: "acudientes",
  })
  Acudiente.belongsToMany(Estudiante, {
    through: AcudienteEstudiante,
    foreignKey: "acudiente_id",
    otherKey: "estudiante_id",
    as: "estudiantes",
  })

  // FichaEstudiante (1:1) — expediente de caracterización
  // ON DELETE CASCADE: si se elimina el estudiante, la ficha también
  Estudiante.hasOne(FichaEstudiante, {
    foreignKey: "estudiante_id",
    as: "ficha",
    onDelete: "CASCADE",
  })
  FichaEstudiante.belongsTo(Estudiante, {
    foreignKey: "estudiante_id",
    as: "estudiante",
  })

  // ColegiosAnteriores (1:N) — historial de instituciones previas
  Estudiante.hasMany(ColegioAnterior, {
    foreignKey: "estudiante_id",
    as: "colegios_anteriores",
    onDelete: "CASCADE",
  })
  ColegioAnterior.belongsTo(Estudiante, {
    foreignKey: "estudiante_id",
    as: "estudiante",
  })

  // ViviendaEstudiante (1:1) — datos socioeconómicos del hogar
  Estudiante.hasOne(ViviendaEstudiante, {
    foreignKey: "estudiante_id",
    as: "vivienda",
    onDelete: "CASCADE",
  })
  ViviendaEstudiante.belongsTo(Estudiante, {
    foreignKey: "estudiante_id",
    as: "estudiante",
  })

  // ----------------------------------------------------------
  // Profesor
  // ----------------------------------------------------------

  Profesor.hasMany(ReemplazoProfesor, { foreignKey: "profesor_id", as: "reemplazos_realizados" })
  Profesor.hasMany(ReemplazoProfesor, { foreignKey: "reemplaza_a_profesor_id", as: "reemplazos_recibidos" })

  ReemplazoProfesor.belongsTo(Profesor, { foreignKey: "profesor_id", as: "profesor_reemplazante" })
  ReemplazoProfesor.belongsTo(Profesor, { foreignKey: "reemplaza_a_profesor_id", as: "profesor_reemplazado" })

  Jornada.hasMany(Profesor, { foreignKey: "jornada_id", as: "profesores_jornada" })
  Profesor.belongsTo(Jornada, { foreignKey: "jornada_id", as: "jornada" })

  // ----------------------------------------------------------
  // Matrícula
  // ----------------------------------------------------------

  // Curso (1:N) - un curso puede tener muchas matriculas, asi es como se referenciara año y curso
  Curso.hasMany(Matricula, { foreignKey: "curso_id", as: "matriculas" })
  Matricula.belongsTo(Curso, { foreignKey: "curso_id", as: "curso" })

  // Jornada (1:N) - una jornada puede tener muchas amtriculas pero una matricula solo puede estar en una jornada
  Jornada.hasMany(Matricula, { foreignKey: "jornada_id", as: "matriculas" })
  Matricula.belongsTo(Jornada, { foreignKey: "jornada_id", as: "jornada" })

  // Antes matricula necesitaba un profesor (Error de diseño, se penso que se le asignaria un profesor a un estudiante)
  // Profesor.hasMany(Matricula, { foreignKey: "profesor_id", as: "matriculas" })
  // Matricula.belongsTo(Profesor, { foreignKey: "profesor_id", as: "profesor" })

  // Periodo de matricula (1:N) - Un periodo puede tener muchas matriculas pero una matricula en un solo periodo
  PeriodoMatricula.hasMany(Matricula, { foreignKey: "periodo_id", as: "matriculas" })
  Matricula.belongsTo(PeriodoMatricula, { foreignKey: "periodo_id", as: "periodo" })

  // Historial de matriculas (1:N)
  Matricula.hasMany(MatriculaHistorial, { foreignKey: "matricula_id", as: "historial" })
  MatriculaHistorial.belongsTo(Matricula, { foreignKey: "matricula_id", as: "matricula" })

  // ----------------------------------------------------------
  // Archivos
  // ----------------------------------------------------------

  Archivos.belongsToMany(Matricula, {
    through: MatriculaArchivo,
    foreignKey: "archivo_id",
    otherKey: "matricula_id",
    as: "matricula_archivo",
  })

  TipoArchivo.hasMany(Archivos, { foreignKey: "tipo_archivo_id", as: "tipoArchivo" })
  Archivos.belongsTo(TipoArchivo, { foreignKey: "tipo_archivo_id", as: "archivos" })



  // ----------------------------------------------------------
  // Auditoría
  // ----------------------------------------------------------

  Usuario.hasMany(Auditoria, { foreignKey: "usuario_id", as: "auditorias" })
  Auditoria.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" })
}

export const initializeModels = () => {
  setupAssociations()
  console.log("✅ Sequelize models initialized with associations")
}

export const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force })
    console.log(`✅ Database ${force ? "reset" : "synchronized"} successfully`)
  } catch (error) {
    console.error("❌ Error de syncronozacion de base de datos:", error)
    throw error
  }
}

// Re-exportar todos los modelos desde un único punto de entrada
export {
  // Existentes
  Persona,
  Usuario,
  Role,
  UsuarioRole,
  Estudiante,
  Profesor,
  ReemplazoProfesor,
  Administrativo,
  Curso,
  Matricula,
  Jornada,
  TipoDocumento,
  Archivos,
  Permiso,
  RolePermiso,
  Egresado,
  Acudiente,
  AcudienteEstudiante,
  Auditoria,
  FichaEstudiante,
  ColegioAnterior,
  ViviendaEstudiante,
  MatriculaHistorial
}