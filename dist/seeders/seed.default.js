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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// =============================================================================
// SEED DEFAULT — datos de configuración del sistema
//
// Este seed contiene datos reales que el sistema necesita para funcionar:
// roles, permisos, jornadas, tipos de documento y tipos de archivo.
//
// Es idempotente: se puede correr múltiples veces sin duplicar datos.
// Usa ON CONFLICT DO NOTHING en todos los inserts.
//
// Uso:
//   npx ts-node src/seeds/seed.default.ts
//   o desde npm scripts: npm run seed:default
// =============================================================================
// -----------------------------------------------------------------------------
// ROLES
// -----------------------------------------------------------------------------
const seedRoles = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = [
        { nombre: "admin", descripcion: "Administrador del sistema con acceso total" },
        { nombre: "profesor", descripcion: "Docente con acceso a cursos y matrículas" },
        { nombre: "estudiante", descripcion: "Estudiante matriculado en la institución" },
        { nombre: "administrativo", descripcion: "Personal administrativo de la institución" },
    ];
    for (const role of roles) {
        yield (0, database_1.query)(`INSERT INTO roles (nombre, descripcion)
       VALUES ($1, $2)`, [role.nombre, role.descripcion], client);
    }
    console.log("  ✓ Roles creados");
});
// -----------------------------------------------------------------------------
// PERMISOS — recurso + acción por cada entidad del sistema
// -----------------------------------------------------------------------------
const seedPermisos = (client) => __awaiter(void 0, void 0, void 0, function* () {
    // Matriz de permisos: cada recurso tiene sus acciones
    const recursos = [
        "usuarios", "personas", "estudiantes", "profesores",
        "administrativos", "cursos", "matriculas", "documentos",
        "roles", "permisos", "acudientes", "jornadas", "expedientes",
    ];
    const acciones = ["create", "read", "update", "delete"];
    const permisos = [];
    for (const recurso of recursos) {
        for (const accion of acciones) {
            permisos.push({
                nombre: `${recurso}:${accion}`,
                recurso,
                accion,
            });
        }
        // manage = acceso completo al recurso (atajo para admin)
        permisos.push({ nombre: `${recurso}:manage`, recurso, accion: "manage" });
    }
    for (const permiso of permisos) {
        yield (0, database_1.query)(`INSERT INTO permisos (nombre, recurso, accion)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`, [permiso.nombre, permiso.recurso, permiso.accion], client);
    }
    console.log(`  ✓ ${permisos.length} permisos creados`);
});
// -----------------------------------------------------------------------------
// ASIGNAR PERMISOS A ROLES
// admin     → manage en todos los recursos
// profesor  → read en estudiantes, cursos, matrículas; read/update en expedientes
// administrativo → read en la mayoría; create/update en estudiantes y matrículas
// -----------------------------------------------------------------------------
const seedRolePermisos = (client) => __awaiter(void 0, void 0, void 0, function* () {
    // Obtener IDs de roles
    const rolesResult = yield (0, database_1.query)(`SELECT role_id, nombre FROM roles`, [], client);
    const roles = {};
    rolesResult.rows.forEach((r) => { roles[r.nombre] = r.role_id; });
    // Helper para obtener permiso_id por nombre
    const getPermiso = (nombre) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const res = yield (0, database_1.query)(`SELECT permiso_id FROM permisos WHERE nombre = $1`, [nombre], client);
        return (_b = (_a = res.rows[0]) === null || _a === void 0 ? void 0 : _a.permiso_id) !== null && _b !== void 0 ? _b : null;
    });
    const assignPermiso = (roleNombre, permisoNombre) => __awaiter(void 0, void 0, void 0, function* () {
        const roleId = roles[roleNombre];
        const permisoId = yield getPermiso(permisoNombre);
        if (!roleId || !permisoId)
            return;
        yield (0, database_1.query)(`INSERT INTO role_permisos (role_id, permiso_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`, [roleId, permisoId], client);
    });
    // Admin → manage en todo
    const recursos = [
        "usuarios", "personas", "estudiantes", "profesores",
        "administrativos", "cursos", "matriculas", "documentos",
        "roles", "permisos", "acudientes", "jornadas", "expedientes",
    ];
    for (const recurso of recursos) {
        yield assignPermiso("admin", `${recurso}:manage`);
    }
    // Profesor → lectura de lo que necesita para trabajar
    const permisoProfesor = [
        "estudiantes:read", "cursos:read", "matriculas:read",
        "expedientes:read", "expedientes:update",
        "personas:read", "acudientes:read", "documentos:read",
    ];
    for (const p of permisoProfesor)
        yield assignPermiso("profesor", p);
    // Administrativo → gestión operativa
    const permisoAdministrativo = [
        "estudiantes:read", "estudiantes:create", "estudiantes:update",
        "personas:read", "personas:create", "personas:update",
        "matriculas:read", "matriculas:create", "matriculas:update",
        "cursos:read", "jornadas:read",
        "acudientes:read", "acudientes:create",
        "documentos:read", "documentos:create",
        "expedientes:read", "expedientes:update",
    ];
    for (const p of permisoAdministrativo)
        yield assignPermiso("administrativo", p);
    console.log("  ✓ Permisos asignados a roles");
});
// -----------------------------------------------------------------------------
// JORNADAS
// -----------------------------------------------------------------------------
const seedJornadas = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const jornadas = [
        { nombre: "Mañana", hora_inicio: "06:00", hora_fin: "12:00" },
        { nombre: "Tarde", hora_inicio: "12:00", hora_fin: "18:00" },
        { nombre: "Noche", hora_inicio: "18:00", hora_fin: "22:00" },
        { nombre: "Completa", hora_inicio: "06:00", hora_fin: "18:00" },
    ];
    for (const jornada of jornadas) {
        yield (0, database_1.query)(`INSERT INTO jornadas (nombre, hora_inicio, hora_fin)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`, [jornada.nombre, jornada.hora_inicio, jornada.hora_fin], client);
    }
    console.log("  ✓ Jornadas creadas");
});
// -----------------------------------------------------------------------------
// TIPOS DE DOCUMENTO
// -----------------------------------------------------------------------------
const seedTiposDocumento = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const tipos = [
        { tipo_documento: "CC", nombre_documento: "Cédula de Ciudadanía" },
        { tipo_documento: "TI", nombre_documento: "Tarjeta de Identidad" },
        { tipo_documento: "RC", nombre_documento: "Registro Civil" },
        { tipo_documento: "CE", nombre_documento: "Cédula de Extranjería" },
        { tipo_documento: "PA", nombre_documento: "Pasaporte" },
        { tipo_documento: "NIT", nombre_documento: "Número de Identificación Tributaria" },
        { tipo_documento: "PEP", nombre_documento: "Permiso Especial de Permanencia" },
    ];
    for (const tipo of tipos) {
        yield (0, database_1.query)(`INSERT INTO tipo_documento (tipo_documento, nombre_documento)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`, [tipo.tipo_documento, tipo.nombre_documento], client);
    }
    console.log("  ✓ Tipos de documento creados");
});
// -----------------------------------------------------------------------------
// TIPOS DE ARCHIVO
// Incluye aplica_a y requerido_en como TEXT[] —
// dbInit los convertirá a contexto_archivo[] en el arranque.
// -----------------------------------------------------------------------------
const seedTiposArchivo = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const tipos = [
        // Documentos de identidad — aplica a todos
        {
            nombre: "Documento de Identidad",
            descripcion: "Cédula, Tarjeta de Identidad o Registro Civil del estudiante",
            extensiones_permitidas: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
            aplica_a: ["estudiante", "profesor", "administrativo", "acudiente"],
            requerido_en: ["matricula"],
        },
        // Foto de perfil — aplica a todos
        {
            nombre: "Foto de Perfil",
            descripcion: "Fotografía reciente tamaño carnet",
            extensiones_permitidas: [".jpg", ".jpeg", ".png", ".webp"],
            aplica_a: ["estudiante", "profesor", "administrativo", "acudiente"],
            requerido_en: [],
        },
        // Boletín de notas — solo estudiante, requerido en matrícula
        {
            nombre: "Boletín de Notas",
            descripcion: "Boletín de notas del año anterior o del colegio anterior",
            extensiones_permitidas: [".pdf", ".jpg", ".jpeg", ".png"],
            aplica_a: ["estudiante"],
            requerido_en: ["matricula"],
        },
        // Certificado de salud — estudiante, requerido en matrícula
        {
            nombre: "Certificado de Salud",
            descripcion: "Certificado médico que acredita buen estado de salud",
            extensiones_permitidas: [".pdf"],
            aplica_a: ["estudiante"],
            requerido_en: ["matricula"],
        },
        // Certificado de vacunación — estudiante
        {
            nombre: "Certificado de Vacunación",
            descripcion: "Carnet o certificado de vacunas al día",
            extensiones_permitidas: [".pdf", ".jpg", ".jpeg", ".png"],
            aplica_a: ["estudiante"],
            requerido_en: [],
        },
        // Contrato de matrícula — matrícula
        {
            nombre: "Contrato de Matrícula",
            descripcion: "Contrato firmado por el acudiente para formalizar la matrícula",
            extensiones_permitidas: [".pdf"],
            aplica_a: ["estudiante"],
            requerido_en: ["matricula"],
        },
        // Hoja de vida — profesores y administrativos
        {
            nombre: "Hoja de Vida",
            descripcion: "Curriculum vitae del docente o personal administrativo",
            extensiones_permitidas: [".pdf", ".docx"],
            aplica_a: ["profesor", "administrativo"],
            requerido_en: [],
        },
        // Título profesional — profesores
        {
            nombre: "Título Profesional",
            descripcion: "Diploma o acta de grado del docente",
            extensiones_permitidas: [".pdf", ".jpg", ".jpeg", ".png"],
            aplica_a: ["profesor"],
            requerido_en: [],
        },
        // Paz y salvo — aplica a todos
        {
            nombre: "Paz y Salvo",
            descripcion: "Documento que certifica que no tiene deudas pendientes con la institución",
            extensiones_permitidas: [".pdf"],
            aplica_a: ["estudiante", "profesor", "administrativo"],
            requerido_en: [],
        },
    ];
    for (const tipo of tipos) {
        yield (0, database_1.query)(`INSERT INTO tipos_archivo
         (nombre, descripcion, extensiones_permitidas, activo, aplica_a, requerido_en)
       VALUES ($1, $2, $3, true, $4, $5)
       ON CONFLICT (nombre) DO NOTHING`, [
            tipo.nombre,
            tipo.descripcion,
            tipo.extensiones_permitidas,
            tipo.aplica_a,
            tipo.requerido_en,
        ], client);
    }
    console.log("  ✓ Tipos de archivo creados");
});
// -----------------------------------------------------------------------------
// CURSOS — grados del sistema educativo colombiano
// -----------------------------------------------------------------------------
const seedCursos = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const cursos = [
        // Primaria
        { nombre: "Primero A", grado: "1" },
        { nombre: "Primero B", grado: "1" },
        { nombre: "Segundo A", grado: "2" },
        { nombre: "Tercero A", grado: "3" },
        { nombre: "Cuarto A", grado: "4" },
        { nombre: "Quinto A", grado: "5" },
        // Secundaria
        { nombre: "Sexto A", grado: "6" },
        { nombre: "Séptimo A", grado: "7" },
        { nombre: "Octavo A", grado: "8" },
        { nombre: "Noveno A", grado: "9" },
        // Media
        { nombre: "Décimo A", grado: "10" },
        { nombre: "Undécimo A", grado: "11" },
    ];
    for (const curso of cursos) {
        yield (0, database_1.query)(`INSERT INTO cursos (nombre, grado)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`, [curso.nombre, curso.grado], client);
    }
    console.log("  ✓ Cursos creados");
});
// -----------------------------------------------------------------------------
// USUARIO ADMIN — cuenta de acceso inicial al sistema
// Contraseña: Admin123! (el usuario debe cambiarla al primer login)
// -----------------------------------------------------------------------------
const seedAdminUser = (client) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Verificar si ya existe
    const existingAdmin = yield (0, database_1.query)(`SELECT usuario_id FROM usuarios WHERE email = 'admin@sigap.edu.co'`, [], client);
    if (existingAdmin.rows.length > 0) {
        console.log("  ✓ Usuario admin ya existe — omitido");
        return;
    }
    // Crear persona del admin
    const tipoDocResult = yield (0, database_1.query)(`SELECT tipo_documento_id FROM tipo_documento WHERE tipo_documento = 'CC' LIMIT 1`, [], client);
    const tipoDocId = (_b = (_a = tipoDocResult.rows[0]) === null || _a === void 0 ? void 0 : _a.tipo_documento_id) !== null && _b !== void 0 ? _b : 1;
    const personaResult = yield (0, database_1.query)(`INSERT INTO personas
       (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento, fecha_nacimiento, genero)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING persona_id`, ["Administrador", "Sistema", "SIGAP", tipoDocId, "0000000000", "1990-01-01", "Masculino"], client);
    const personaId = personaResult.rows[0].persona_id;
    // Crear usuario
    const hashedPassword = yield bcryptjs_1.default.hash("Admin123!", 12);
    const usuarioResult = yield (0, database_1.query)(`INSERT INTO usuarios (persona_id, username, email, contraseña, activo)
     VALUES ($1, $2, $3, $4, true)
     RETURNING usuario_id`, [personaId, "admin", "admin@sigap.edu.co", hashedPassword], client);
    const usuarioId = usuarioResult.rows[0].usuario_id;
    // Obtener role admin
    const roleResult = yield (0, database_1.query)(`SELECT role_id FROM roles WHERE nombre = 'admin' LIMIT 1`, [], client);
    const roleId = (_c = roleResult.rows[0]) === null || _c === void 0 ? void 0 : _c.role_id;
    if (roleId) {
        yield (0, database_1.query)(`INSERT INTO usuarios_role (usuario_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [usuarioId, roleId], client);
    }
    // Crear registro de administrativo
    yield (0, database_1.query)(`INSERT INTO administrativos (persona_id, cargo, estado)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`, [personaId, "Administrador del Sistema", true], client);
    console.log("  ✓ Usuario admin creado");
    console.log("    Email:      admin@sigap.edu.co");
    console.log("    Contraseña: Admin123!  ← CAMBIAR INMEDIATAMENTE");
});
// -----------------------------------------------------------------------------
// ENTRY POINT
// -----------------------------------------------------------------------------
const runDefaultSeed = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("\n🌱 Ejecutando seed de datos por defecto...\n");
    try {
        yield (0, database_1.transaction)((client) => __awaiter(void 0, void 0, void 0, function* () {
            yield seedRoles(client);
            yield seedPermisos(client);
            yield seedRolePermisos(client);
            yield seedJornadas(client);
            yield seedTiposDocumento(client);
            yield seedTiposArchivo(client);
            yield seedCursos(client);
            yield seedAdminUser(client);
        }));
        console.log("\n✅ Seed de datos por defecto completado\n");
        process.exit(0);
    }
    catch (error) {
        console.error("\n❌ Error ejecutando seed:", error);
        process.exit(1);
    }
});
runDefaultSeed();
//# sourceMappingURL=seed.default.js.map