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
exports.ViviendaEstudiante = exports.ColegioAnterior = exports.FichaEstudiante = exports.Auditoria = exports.AcudienteEstudiante = exports.Acudiente = exports.Egresado = exports.RolePermiso = exports.Permiso = exports.Archivos = exports.TipoDocumento = exports.Jornada = exports.Matricula = exports.Curso = exports.Administrativo = exports.Profesor = exports.Estudiante = exports.UsuarioRole = exports.Role = exports.Usuario = exports.Persona = exports.syncModels = exports.initializeModels = exports.setupAssociations = void 0;
const database_1 = require("../../config/database");
// Modelos existentes
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
const PeriodoMatricula_1 = require("./PeriodoMatricula");
const MatriculaArchivo_1 = require("./MatriculaArchivo");
const FichaEstudiante_1 = require("./FichaEstudiante");
Object.defineProperty(exports, "FichaEstudiante", { enumerable: true, get: function () { return FichaEstudiante_1.FichaEstudiante; } });
const ColegioAnterior_1 = require("./ColegioAnterior");
Object.defineProperty(exports, "ColegioAnterior", { enumerable: true, get: function () { return ColegioAnterior_1.ColegioAnterior; } });
const ViviendaEstudiante_1 = require("./ViviendaEstudiante");
Object.defineProperty(exports, "ViviendaEstudiante", { enumerable: true, get: function () { return ViviendaEstudiante_1.ViviendaEstudiante; } });
const TipoArchivo_1 = require("./TipoArchivo");
const setupAssociations = () => {
    // ----------------------------------------------------------
    // Persona
    // ----------------------------------------------------------
    Persona_1.Persona.hasOne(Usuario_1.Usuario, { foreignKey: "persona_id", as: "usuario" });
    Usuario_1.Usuario.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Persona_1.Persona.hasOne(Estudiante_1.Estudiante, { foreignKey: "persona_id", as: "estudiante" });
    Estudiante_1.Estudiante.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Persona_1.Persona.hasOne(Profesor_1.Profesor, { foreignKey: "persona_id", as: "profesor" });
    Profesor_1.Profesor.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Persona_1.Persona.hasOne(Administrativo_1.Administrativo, { foreignKey: "persona_id", as: "administrativo" });
    Administrativo_1.Administrativo.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Persona_1.Persona.hasOne(Acudiente_1.Acudiente, { foreignKey: "persona_id", as: "acudiente" });
    Acudiente_1.Acudiente.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    Persona_1.Persona.hasMany(Archivo_1.Archivos, { foreignKey: "persona_id", as: "archivos" });
    Archivo_1.Archivos.belongsTo(Persona_1.Persona, { foreignKey: "persona_id", as: "persona" });
    // ----------------------------------------------------------
    // TipoDocumento
    // ----------------------------------------------------------
    TipoDocumento_1.TipoDocumento.hasMany(Persona_1.Persona, { foreignKey: "tipo_documento_id", as: "personas" });
    Persona_1.Persona.belongsTo(TipoDocumento_1.TipoDocumento, { foreignKey: "tipo_documento_id", as: "tipo_documento" });
    // ----------------------------------------------------------
    // Roles y permisos
    // ----------------------------------------------------------
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
    // ----------------------------------------------------------
    // Estudiante — núcleo del expediente
    // ----------------------------------------------------------
    // Matrícula (1:N) — un estudiante puede tener una matrícula por año
    Estudiante_1.Estudiante.hasMany(Matricula_1.Matricula, { foreignKey: "estudiante_id", as: "matriculas" });
    Matricula_1.Matricula.belongsTo(Estudiante_1.Estudiante, { foreignKey: "estudiante_id", as: "estudiante" });
    // Egresado (1:1)
    Estudiante_1.Estudiante.hasOne(Egresado_1.Egresado, { foreignKey: "estudiante_id", as: "egresado" });
    Egresado_1.Egresado.belongsTo(Estudiante_1.Estudiante, { foreignKey: "estudiante_id", as: "estudiante" });
    // Acudientes (N:M a través de AcudienteEstudiante)
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
    // FichaEstudiante (1:1) — expediente de caracterización
    // ON DELETE CASCADE: si se elimina el estudiante, la ficha también
    Estudiante_1.Estudiante.hasOne(FichaEstudiante_1.FichaEstudiante, {
        foreignKey: "estudiante_id",
        as: "ficha",
        onDelete: "CASCADE",
    });
    FichaEstudiante_1.FichaEstudiante.belongsTo(Estudiante_1.Estudiante, {
        foreignKey: "estudiante_id",
        as: "estudiante",
    });
    // ColegiosAnteriores (1:N) — historial de instituciones previas
    Estudiante_1.Estudiante.hasMany(ColegioAnterior_1.ColegioAnterior, {
        foreignKey: "estudiante_id",
        as: "colegios_anteriores",
        onDelete: "CASCADE",
    });
    ColegioAnterior_1.ColegioAnterior.belongsTo(Estudiante_1.Estudiante, {
        foreignKey: "estudiante_id",
        as: "estudiante",
    });
    // ViviendaEstudiante (1:1) — datos socioeconómicos del hogar
    Estudiante_1.Estudiante.hasOne(ViviendaEstudiante_1.ViviendaEstudiante, {
        foreignKey: "estudiante_id",
        as: "vivienda",
        onDelete: "CASCADE",
    });
    ViviendaEstudiante_1.ViviendaEstudiante.belongsTo(Estudiante_1.Estudiante, {
        foreignKey: "estudiante_id",
        as: "estudiante",
    });
    // ----------------------------------------------------------
    // Matrícula
    // ----------------------------------------------------------
    Curso_1.Curso.hasMany(Matricula_1.Matricula, { foreignKey: "curso_id", as: "matriculas" });
    Matricula_1.Matricula.belongsTo(Curso_1.Curso, { foreignKey: "curso_id", as: "curso" });
    Jornada_1.Jornada.hasMany(Matricula_1.Matricula, { foreignKey: "jornada_id", as: "matriculas" });
    Matricula_1.Matricula.belongsTo(Jornada_1.Jornada, { foreignKey: "jornada_id", as: "jornada" });
    // Profesor.hasMany(Matricula, { foreignKey: "profesor_id", as: "matriculas" })
    // Matricula.belongsTo(Profesor, { foreignKey: "profesor_id", as: "profesor" })
    PeriodoMatricula_1.PeriodoMatricula.hasMany(Matricula_1.Matricula, { foreignKey: "periodo_id", as: "matriculas" });
    Matricula_1.Matricula.belongsTo(PeriodoMatricula_1.PeriodoMatricula, { foreignKey: "periodo_id", as: "periodo" });
    // ----------------------------------------------------------
    // Archivos
    // ----------------------------------------------------------
    Archivo_1.Archivos.belongsToMany(Matricula_1.Matricula, {
        through: MatriculaArchivo_1.MatriculaArchivo,
        foreignKey: "matricula_id",
        otherKey: "archivo_id",
        as: "matricula_archivo",
    });
    TipoArchivo_1.TipoArchivo.hasMany(Archivo_1.Archivos, { foreignKey: "tipo_archivo_id", as: "tipoArchivo" });
    Archivo_1.Archivos.belongsTo(TipoArchivo_1.TipoArchivo, { foreignKey: "tipo_archivo_id", as: "archivos" });
    // ----------------------------------------------------------
    // Auditoría
    // ----------------------------------------------------------
    Usuario_1.Usuario.hasMany(Auditoria_1.Auditoria, { foreignKey: "usuario_id", as: "auditorias" });
    Auditoria_1.Auditoria.belongsTo(Usuario_1.Usuario, { foreignKey: "usuario_id", as: "usuario" });
};
exports.setupAssociations = setupAssociations;
const initializeModels = () => {
    (0, exports.setupAssociations)();
    console.log("✅ Sequelize models initialized with associations");
};
exports.initializeModels = initializeModels;
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