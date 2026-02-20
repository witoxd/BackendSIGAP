import { sequelize } from "../../config/database"
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
import { Contacto } from "./Contacto"
import { TipoArchivo } from "./TipoArchivo"

// Definir relaciones entre modelos
export const setupAssociations = () => {
  // Persona - Usuario (1:1)
  Persona.hasOne(Usuario, { foreignKey: "persona_id", as: "usuario" })
  Usuario.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  // Usuario - Roles (N:M)
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
  
  // Persona - Contactos 1:N
  Persona.hasMany(Contacto, { foreignKey: "persona_id", as: "contactos" })
  Contacto.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  // Persona - TipoDoucmento N:1
  Persona.hasOne(TipoDocumento, { foreignKey: "tipo_documento_id", as: "tipo_documento" })
  TipoDocumento.belongsTo(Persona, { foreignKey: "tipo_documento_id", as: "personas" })

  // Persona - Estudiante/Profesor/Administrativo (1:1)
  Persona.hasOne(Estudiante, { foreignKey: "persona_id", as: "estudiante" })
  Estudiante.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  Persona.hasOne(Profesor, { foreignKey: "persona_id", as: "profesor" })
  Profesor.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  Persona.hasOne(Administrativo, { foreignKey: "persona_id", as: "administrativo" })
  Administrativo.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  Persona.hasOne(Acudiente, { foreignKey: "persona_id", as: "acudiente" })
  Acudiente.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  Jornada.hasMany(Matricula, { foreignKey: "jornada_id", as: "matriculas" })
  Matricula.belongsTo(Jornada, { foreignKey: "jornada_id", as: "jornada" })

  // Estudiante - Matricula (1:N)
  Estudiante.hasMany(Matricula, { foreignKey: "estudiante_id", as: "matriculas" })
  Matricula.belongsTo(Estudiante, { foreignKey: "estudiante_id", as: "estudiante" })

  Estudiante.hasOne(Egresado, { foreignKey: "estudiante_id", as: "egresado" })
  Egresado.belongsTo(Estudiante, { foreignKey: "estudiante_id", as: "estudiante" })

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

  // Curso - Matricula (1:N)
  Curso.hasMany(Matricula, { foreignKey: "curso_id", as: "matriculas" })
  Matricula.belongsTo(Curso, { foreignKey: "curso_id", as: "curso" })

  // Profesor - Curso (1:N)
  Profesor.hasMany(Matricula, { foreignKey: "profesor_id", as: "matriculas" })
  Matricula.belongsTo(Profesor, { foreignKey: "profesor_id", as: "profesor" })



  // Persona - Archivos (1:N)
  Persona.hasMany(Archivos, { foreignKey: "persona_id", as: "Archivos" })
  Archivos.belongsTo(Persona, { foreignKey: "persona_id", as: "persona" })

  // TipoArchivo - Archivos (1:N)
  TipoArchivo.hasMany(Archivos, { foreignKey: "tipo_archivo_id", as: "archivos" })
  Archivos.belongsTo(TipoArchivo, { foreignKey: "tipo_archivo_id", as: "tipo_archivo" })

  // Usuario - Auditoria (1:N)
  Usuario.hasMany(Auditoria, { foreignKey: "usuario_id", as: "auditorias" })
  Auditoria.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" })
}

// Inicializar todos los modelos
export const initializeModels = () => {
  setupAssociations()
  console.log("✅ Sequelize models initialized with associations")
}

// Sincronizar modelos con la base de datos (solo en desarrollo)
export const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force })
    console.log(`✅ Database ${force ? "reset" : "synchronized"} successfully`)
  } catch (error) {
    console.error("❌ Error synchronizing database:", error)
    throw error
  }
}

export {
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
}
