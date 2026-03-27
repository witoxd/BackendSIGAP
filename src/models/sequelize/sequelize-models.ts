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
import { HasMany } from "sequelize"
import { TipoArchivo } from "./TipoArchivo"

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

  TipoDocumento.hasMany(Persona, { foreignKey: "tipo_documento_id", as: "personas" })
  Persona.belongsTo(TipoDocumento, { foreignKey: "tipo_documento_id", as: "tipo_documento" })

  // ----------------------------------------------------------
  // Roles y permisos
  // ----------------------------------------------------------

  Usuario.belongsToMany(Role, {
    through: UsuarioRole,
    foreignKey: "usuario_id",
    otherKey: "role_id",
    as: "roles",
  })
  Role.belongsToMany(Usuario, {
    through: UsuarioRole,
    foreignKey: "role_id",
    otherKey: "usuario_id",
    as: "usuarios",
  })

  Role.belongsToMany(Permiso, {
    through: RolePermiso,
    foreignKey: "role_id",
    otherKey: "permiso_id",
    as: "permisos",
  })
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
  // Matrícula
  // ----------------------------------------------------------

  Curso.hasMany(Matricula, { foreignKey: "curso_id", as: "matriculas" })
  Matricula.belongsTo(Curso, { foreignKey: "curso_id", as: "curso" })

  Jornada.hasMany(Matricula, { foreignKey: "jornada_id", as: "matriculas" })
  Matricula.belongsTo(Jornada, { foreignKey: "jornada_id", as: "jornada" })

  // Profesor.hasMany(Matricula, { foreignKey: "profesor_id", as: "matriculas" })
  // Matricula.belongsTo(Profesor, { foreignKey: "profesor_id", as: "profesor" })

  PeriodoMatricula.hasMany(Matricula, {foreignKey: "periodo_id", as: "matriculas"})
  Matricula.belongsTo(PeriodoMatricula, {foreignKey: "periodo_id", as: "periodo"})


  // ----------------------------------------------------------
  // Archivos
  // ----------------------------------------------------------

    Archivos.belongsToMany(Matricula, {
    through: MatriculaArchivo,
    foreignKey: "matricula_id",
    otherKey: "archivo_id",
    as: "matricula_archivo",
  })

  TipoArchivo.hasMany(Archivos, {foreignKey: "tipo_archivo_id", as: "tipoArchivo"})
  Archivos.belongsTo(TipoArchivo, {foreignKey: "tipo_archivo_id", as: "archivos"})


  
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
    console.error("❌ Error synchronizing database:", error)
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
}