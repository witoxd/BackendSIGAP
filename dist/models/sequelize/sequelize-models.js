"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auditoria = exports.AcudienteEstudiante = exports.Acudiente = exports.Egresado = exports.RolePermiso = exports.Permiso = exports.Archivos = exports.TipoDocumento = exports.Jornada = exports.Sede = exports.Matricula = exports.Curso = exports.Administrativo = exports.Profesor = exports.Estudiante = exports.UsuarioRole = exports.Role = exports.Usuario = exports.Persona = exports.syncModels = exports.initializeModels = exports.setupAssociations = void 0;
const database_1 = require("../../config/database");
const Persona_1 = require("./Persona");
Object.defineProperty(exports, "Persona", { enumerable: true, get: function () { return Persona_1.Persona; } });
const Usuario_1 = require("./Usuario");
Object.defineProperty(exports, "Usuario", { enumerable: true, get: function () { return Usuario_1.Usuario; } });
const Role_1 = require("./Role");
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return Role_1.Role; } });
const UsuarioRole_1 = require("./UsuarioRole");
Object.defineProperty(exports, "UsuarioRole", { enumerable: true, get: function () { return UsuarioRole_1.UsuarioRole; } });
const Estudiante_1 = require("./Estudiante");
Object.defineProperty(exports, "Estudiante", { enumerable: true, get: function () { return Estudiante_1.Estudiante; } });
const Profesor_1 = require("./Profesor");
Object.defineProperty(exports, "Profesor", { enumerable: true, get: function () { return Profesor_1.Profesor; } });
const Administrativo_1 = require("./Administrativo");
Object.defineProperty(exports, "Administrativo", { enumerable: true, get: function () { return Administrativo_1.Administrativo; } });
const Curso_1 = require("./Curso");
Object.defineProperty(exports, "Curso", { enumerable: true, get: function () { return Curso_1.Curso; } });
const Matricula_1 = require("./Matricula");
Object.defineProperty(exports, "Matricula", { enumerable: true, get: function () { return Matricula_1.Matricula; } });
const Sede_1 = require("./Sede");
Object.defineProperty(exports, "Sede", { enumerable: true, get: function () { return Sede_1.Sede; } });
const Jornada_1 = require("./Jornada");
Object.defineProperty(exports, "Jornada", { enumerable: true, get: function () { return Jornada_1.Jornada; } });
const TipoDocumento_1 = require("./TipoDocumento");
Object.defineProperty(exports, "TipoDocumento", { enumerable: true, get: function () { return TipoDocumento_1.TipoDocumento; } });
const Archivo_1 = require("./Archivo");
Object.defineProperty(exports, "Archivos", { enumerable: true, get: function () { return Archivo_1.Archivos; } });
const Permiso_1 = require("./Permiso");
Object.defineProperty(exports, "Permiso", { enumerable: true, get: function () { return Permiso_1.Permiso; } });
const RolePermiso_1 = require("./RolePermiso");
Object.defineProperty(exports, "RolePermiso", { enumerable: true, get: function () { return RolePermiso_1.RolePermiso; } });
const Egresado_1 = require("./Egresado");
Object.defineProperty(exports, "Egresado", { enumerable: true, get: function () { return Egresado_1.Egresado; } });
const Acudiente_1 = require("./Acudiente");
Object.defineProperty(exports, "Acudiente", { enumerable: true, get: function () { return Acudiente_1.Acudiente; } });
const AcudienteEstudiante_1 = require("./AcudienteEstudiante");
Object.defineProperty(exports, "AcudienteEstudiante", { enumerable: true, get: function () { return AcudienteEstudiante_1.AcudienteEstudiante; } });
const Auditoria_1 = require("./Auditoria");
Object.defineProperty(exports, "Auditoria", { enumerable: true, get: function () { return Auditoria_1.Auditoria; } });
// Definir relaciones entre modelos
const setupAssociations = () => {
    // Persona - Usuario (1:1)
    Persona_1.Persona.hasOne(Usuario_1.Usuario, { foreignKey: "persona_id", as: "usuario" });
    Usuario_1.Usuario.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    // Usuario - Roles (N:M)
    Usuario_1.Usuario.belongsToMany(Role_1.Role, {
        through: UsuarioRole_1.UsuarioRole,
        foreignKey: "usuario_id",
        otherKey: "role_id",
        as: "roles",
    });
    Role_1.Role.belongsToMany(Usuario_1.Usuario, {
        through: UsuarioRole_1.UsuarioRole,
        foreignKey: "role_id",
        otherKey: "usuario_id",
        as: "usuarios",
    });
    Role_1.Role.belongsToMany(Permiso_1.Permiso, {
        through: RolePermiso_1.RolePermiso,
        foreignKey: "role_id",
        otherKey: "permiso_id",
        as: "permisos",
    });
    Permiso_1.Permiso.belongsToMany(Role_1.Role, {
        through: RolePermiso_1.RolePermiso,
        foreignKey: "permiso_id",
        otherKey: "role_id",
        as: "roles",
    });
    Persona_1.Persona.hasOne(TipoDocumento_1.TipoDocumento, { foreignKey: "tipo_documento_id", as: "tipo_documento" });
    TipoDocumento_1.TipoDocumento.belongsTo(Persona_1.Persona, { foreignKey: "tipo_documento_id", as: "personas" });
    // Persona - Estudiante/Profesor/Administrativo (1:1)
    Persona_1.Persona.hasOne(Estudiante_1.Estudiante, { foreignKey: "persona_id", as: "estudiante" });
    Estudiante_1.Estudiante.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Persona_1.Persona.hasOne(Profesor_1.Profesor, { foreignKey: "persona_id", as: "profesor" });
    Profesor_1.Profesor.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Persona_1.Persona.hasOne(Administrativo_1.Administrativo, { foreignKey: "persona_id", as: "administrativo" });
    Administrativo_1.Administrativo.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Persona_1.Persona.hasOne(Acudiente_1.Acudiente, { foreignKey: "persona_id", as: "acudiente" });
    Acudiente_1.Acudiente.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Sede_1.Sede.hasMany(Estudiante_1.Estudiante, { foreignKey: "sede_id", as: "estudiantes" });
    Estudiante_1.Estudiante.belongsTo(Sede_1.Sede, { foreignKey: "sede_id", as: "sede" });
    Sede_1.Sede.hasMany(Profesor_1.Profesor, { foreignKey: "sede_id", as: "profesores" });
    Profesor_1.Profesor.belongsTo(Sede_1.Sede, { foreignKey: "sede_id", as: "sede" });
    Sede_1.Sede.hasMany(Administrativo_1.Administrativo, { foreignKey: "sede_id", as: "administrativos" });
    Administrativo_1.Administrativo.belongsTo(Sede_1.Sede, { foreignKey: "sede_id", as: "sede" });
    Jornada_1.Jornada.hasMany(Estudiante_1.Estudiante, { foreignKey: "jornada_id", as: "estudiantes" });
    Estudiante_1.Estudiante.belongsTo(Jornada_1.Jornada, { foreignKey: "jornada_id", as: "jornada" });
    // Estudiante - Matricula (1:N)
    Estudiante_1.Estudiante.hasMany(Matricula_1.Matricula, { foreignKey: "estudiante_id", as: "matriculas" });
    Matricula_1.Matricula.belongsTo(Estudiante_1.Estudiante, { foreignKey: "estudiante_id", as: "estudiante" });
    Estudiante_1.Estudiante.hasOne(Egresado_1.Egresado, { foreignKey: "estudiante_id", as: "egresado" });
    Egresado_1.Egresado.belongsTo(Estudiante_1.Estudiante, { foreignKey: "estudiante_id", as: "estudiante" });
    Estudiante_1.Estudiante.belongsToMany(Acudiente_1.Acudiente, {
        through: AcudienteEstudiante_1.AcudienteEstudiante,
        foreignKey: "estudiante_id",
        otherKey: "acudiente_id",
        as: "acudientes",
    });
    Acudiente_1.Acudiente.belongsToMany(Estudiante_1.Estudiante, {
        through: AcudienteEstudiante_1.AcudienteEstudiante,
        foreignKey: "acudiente_id",
        otherKey: "estudiante_id",
        as: "estudiantes",
    });
    // Curso - Matricula (1:N)
    Curso_1.Curso.hasMany(Matricula_1.Matricula, { foreignKey: "curso_id", as: "matriculas" });
    Matricula_1.Matricula.belongsTo(Curso_1.Curso, { foreignKey: "curso_id", as: "curso" });
    // Profesor - Curso (1:N)
    Profesor_1.Profesor.hasMany(Matricula_1.Matricula, { foreignKey: "profesor_id", as: "matriculas" });
    Matricula_1.Matricula.belongsTo(Profesor_1.Profesor, { foreignKey: "profesor_id", as: "profesor" });
    // Persona - DocumentoPersona (1:N)
    Persona_1.Persona.hasMany(Archivo_1.Archivos, { foreignKey: "persona_id", as: "Archivos" });
    Archivo_1.Archivos.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Usuario_1.Usuario.hasMany(Auditoria_1.Auditoria, { foreignKey: "usuario_id", as: "auditorias" });
    Auditoria_1.Auditoria.belongsTo(Usuario_1.Usuario, { foreignKey: "usuario_id", as: "usuario" });
};
exports.setupAssociations = setupAssociations;
// Inicializar todos los modelos
const initializeModels = () => {
    (0, exports.setupAssociations)();
    console.log("✅ Sequelize models initialized with associations");
};
exports.initializeModels = initializeModels;
// Sincronizar modelos con la base de datos (solo en desarrollo)
const syncModels = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (force = false) {
    try {
        yield database_1.sequelize.sync({ force, alter: !force });
        console.log(`✅ Database ${force ? "reset" : "synchronized"} successfully`);
    }
    catch (error) {
        console.error("❌ Error synchronizing database:", error);
        throw error;
    }
});
exports.syncModels = syncModels;
//# sourceMappingURL=sequelize-models.js.map