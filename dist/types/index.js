"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recurso = exports.Accion = exports.RoleType = void 0;
var RoleType;
(function (RoleType) {
    RoleType["ADMIN"] = "admin";
    RoleType["ESTUDIANTE"] = "estudiante";
    RoleType["PROFESOR"] = "profesor";
    RoleType["ADMINISTRATIVO"] = "administrativo";
})(RoleType || (exports.RoleType = RoleType = {}));
var Accion;
(function (Accion) {
    Accion["CREATE"] = "create";
    Accion["READ"] = "read";
    Accion["UPDATE"] = "update";
    Accion["DELETE"] = "delete";
    Accion["MANAGE"] = "manage";
})(Accion || (exports.Accion = Accion = {}));
var Recurso;
(function (Recurso) {
    Recurso["USUARIOS"] = "usuarios";
    Recurso["PERSONAS"] = "personas";
    Recurso["ESTUDIANTES"] = "estudiantes";
    Recurso["PROFESORES"] = "profesores";
    Recurso["ADMINISTRATIVOS"] = "administrativos";
    Recurso["CURSOS"] = "cursos";
    Recurso["MATRICULAS"] = "matriculas";
    Recurso["DOCUMENTOS"] = "documentos";
    Recurso["ASISTENCIAS"] = "asistencias";
    Recurso["CALIFICACIONES"] = "calificaciones";
    Recurso["ROLES"] = "roles";
    Recurso["PERMISOS"] = "permisos";
    Recurso["ACUDIENTES"] = "acudientes";
    Recurso["JORNADAS"] = "jornadas";
})(Recurso || (exports.Recurso = Recurso = {}));
//# sourceMappingURL=index.js.map