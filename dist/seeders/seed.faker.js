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
const es_1 = require("@faker-js/faker/locale/es");
// =============================================================================
// SEED FAKER — datos falsos para desarrollo y pruebas
//
// Genera datos realistas en español usando @faker-js/faker.
// Depende de seed.default.ts — corre ese primero.
//
// Lo que crea:
//   - 5 profesores con usuario y persona
//   - 3 administrativos con usuario y persona
//   - 30 estudiantes con usuario, persona, acudiente, ficha y vivienda
//   - 1 período de matrícula activo para el año actual
//   - Matrículas para todos los estudiantes
//
// Uso:
//   npx ts-node src/seeds/seed.faker.ts
//   o: npm run seed:faker
//
// Instalación de dependencia:
//   npm install --save-dev @faker-js/faker
// =============================================================================
es_1.faker.seed(42); // Seed fijo para reproducibilidad — mismo resultado cada ejecución
// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
const gruposSanguineos = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const generos = ["Masculino", "Femenino"];
const tiposTransporte = ["Bus", "Moto", "A pie", "Bicicleta", "Carro particular"];
const eps = ["Sura", "Sanitas", "Nueva EPS", "Compensar", "Coosalud", "Cajacopi"];
const credos = ["Católico", "Cristiano", "Evangélico", "Ninguno", "Otro"];
const gruposEtnicos = ["Mestizo", "Afrocolombiano", "Indígena", "Ninguno"];
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Genera un número de documento
const generarDocumento = (tipo) => {
    if (tipo === "CC")
        return es_1.faker.string.numeric({ length: { min: 8, max: 10 } });
    if (tipo === "TI")
        return es_1.faker.string.numeric({ length: 10 });
    return es_1.faker.string.numeric({ length: 11 });
};
// Genera un username único a partir del nombre
const generarUsername = (nombres, apellido) => {
    const base = `${nombres.split(" ")[0].toLowerCase()}.${apellido.toLowerCase()}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9.]/g, "");
    return `${base}${es_1.faker.string.numeric(3)}`;
};
// Contraseña hasheada por defecto para todos los usuarios de prueba
let hashedDefaultPassword;
// -----------------------------------------------------------------------------
// OBTENER IDs de tablas ya pobladas por seed.default
// -----------------------------------------------------------------------------
const getIds = (client) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const [tiposDoc, jornadas, cursos, roleProfesor, roleEstudiante, roleAdmin] = yield Promise.all([
        (0, database_1.query)(`SELECT tipo_documento_id, tipo_documento FROM tipo_documento`, [], client),
        (0, database_1.query)(`SELECT jornada_id FROM jornadas`, [], client),
        (0, database_1.query)(`SELECT curso_id FROM cursos ORDER BY grado`, [], client),
        (0, database_1.query)(`SELECT role_id FROM roles WHERE nombre = 'profesor'`, [], client),
        (0, database_1.query)(`SELECT role_id FROM roles WHERE nombre = 'estudiante'`, [], client),
        (0, database_1.query)(`SELECT role_id FROM roles WHERE nombre = 'administrativo'`, [], client),
    ]);
    return {
        tiposDoc: tiposDoc.rows,
        jornadas: jornadas.rows,
        cursos: cursos.rows,
        roleProfesor: (_a = roleProfesor.rows[0]) === null || _a === void 0 ? void 0 : _a.role_id,
        roleEstudiante: (_b = roleEstudiante.rows[0]) === null || _b === void 0 ? void 0 : _b.role_id,
        roleAdmin: (_c = roleAdmin.rows[0]) === null || _c === void 0 ? void 0 : _c.role_id,
    };
});
// -----------------------------------------------------------------------------
// CREAR PERSONA — base de todos los roles
// -----------------------------------------------------------------------------
const crearPersona = (client_1, tipoDocId_1, ...args_1) => __awaiter(void 0, [client_1, tipoDocId_1, ...args_1], void 0, function* (client, tipoDocId, overrides = {}) {
    var _a, _b, _c, _d;
    const genero = overrides.genero || randomItem(generos);
    const sexo = genero === "Masculino" ? "male" : "female";
    const nombres = (_a = overrides.nombres) !== null && _a !== void 0 ? _a : es_1.faker.person.firstName(sexo);
    const apellidoP = (_b = overrides.apellido_p) !== null && _b !== void 0 ? _b : es_1.faker.person.lastName();
    const apellidoM = (_c = overrides.apellido_m) !== null && _c !== void 0 ? _c : es_1.faker.person.lastName();
    const doc = (_d = overrides.doc) !== null && _d !== void 0 ? _d : generarDocumento("CC");
    const result = yield (0, database_1.query)(`INSERT INTO personas
       (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,
        fecha_nacimiento, genero, grupo_sanguineo, grupo_etnico, credo_religioso,
        lugar_nacimiento, expedida_en)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (numero_documento) DO UPDATE
       SET nombres = EXCLUDED.nombres
     RETURNING *`, [
        nombres, apellidoP, apellidoM, tipoDocId, doc,
        es_1.faker.date.birthdate({ min: 20, max: 60, mode: "age" }).toISOString().split("T")[0],
        genero,
        randomItem(gruposSanguineos),
        randomItem(gruposEtnicos),
        randomItem(credos),
        es_1.faker.location.city(),
        es_1.faker.location.city(),
    ], client);
    return result.rows[0];
});
// -----------------------------------------------------------------------------
// CREAR USUARIO vinculado a una persona
// -----------------------------------------------------------------------------
// const crearUsuario = async (
//   client: any,
//   personaId: number,
//   persona: any,
//   roleId: number
// ) => {
//   const username = generarUsername(persona.nombres, persona.apellido_paterno)
//   const email    = faker.internet.email({
//     firstName: persona.nombres.split(" ")[0],
//     lastName:  persona.apellido_paterno,
//   }).toLowerCase()
//   // Verificar si ya tiene usuario
//   const existing = await query(
//     `SELECT usuario_id FROM usuarios WHERE persona_id = $1`, [personaId], client
//   )
//   if (existing.rows.length > 0) return existing.rows[0]
//   const usuarioResult = await query(
//     `INSERT INTO usuarios (persona_id, username, email, contraseña, activo)
//      VALUES ($1, $2, $3, $4, true)
//      ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
//      RETURNING *`,
//     [personaId, username, email, hashedDefaultPassword],
//     client
//   )
//   const usuario = usuarioResult.rows[0]
//   await query(
//     `INSERT INTO usuarios_role (usuario_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
//     [usuario.usuario_id, roleId],
//     client
//   )
//   return usuario
// }
// -----------------------------------------------------------------------------
// SEED PROFESORES
// -----------------------------------------------------------------------------
const seedProfesores = (client, ids) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("  → Creando 5 profesores...");
    const tipoCC = ids.tiposDoc.find(t => t.tipo_documento === "CC");
    const profesores = [];
    for (let i = 0; i < 5; i++) {
        const persona = yield crearPersona(client, tipoCC.tipo_documento_id);
        // await crearUsuario(client, persona.persona_id, persona, ids.roleProfesor)
        const profResult = yield (0, database_1.query)(`INSERT INTO profesores (persona_id, fecha_contratacion, estado)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING *`, [
            persona.persona_id,
            es_1.faker.date.past({ years: 10 }).toISOString().split("T")[0],
            "activo",
        ], client);
        if (profResult.rows.length > 0)
            profesores.push(profResult.rows[0]);
    }
    console.log(`  ✓ ${profesores.length} profesores creados`);
    return profesores;
});
// -----------------------------------------------------------------------------
// SEED ADMINISTRATIVOS
// -----------------------------------------------------------------------------
const seedAdministrativos = (client, ids) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("  → Creando 3 administrativos...");
    const tipoCC = ids.tiposDoc.find(t => t.tipo_documento === "CC");
    const cargos = ["Secretaria", "Coordinador Académico", "Rector", "Tesorero", "Psicólogo"];
    for (let i = 0; i < 3; i++) {
        const persona = yield crearPersona(client, tipoCC.tipo_documento_id);
        // await crearUsuario(client, persona.persona_id, persona, ids.roleAdmin)
        yield (0, database_1.query)(`INSERT INTO administrativos (persona_id, cargo, estado)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`, [persona.persona_id, randomItem(cargos), true], client);
    }
    console.log("  ✓ 3 administrativos creados");
});
// -----------------------------------------------------------------------------
// SEED ESTUDIANTES con ficha, vivienda y acudiente
// -----------------------------------------------------------------------------
const seedEstudiantes = (client, ids, periodoId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("  → Creando 30 estudiantes con ficha, vivienda y acudiente...");
    const tipoCC = ids.tiposDoc.find(t => t.tipo_documento === "CC");
    const tipoTI = ids.tiposDoc.find(t => t.tipo_documento === "TI");
    const cursosDisponibles = [...ids.cursos];
    for (let i = 0; i < 30; i++) {
        // 1. Persona del estudiante (usa TI para menores)
        const genero = randomItem(generos);
        const sexo = genero === "Masculino" ? "male" : "female";
        const nombres = es_1.faker.person.firstName(sexo);
        const apellidoP = es_1.faker.person.lastName();
        const apellidoM = es_1.faker.person.lastName();
        const personaEstudiante = yield (0, database_1.query)(`INSERT INTO personas
         (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,
          fecha_nacimiento, genero, grupo_sanguineo, grupo_etnico, credo_religioso,
          lugar_nacimiento, expedida_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (numero_documento) DO UPDATE SET nombres = EXCLUDED.nombres
       RETURNING *`, [
            nombres, apellidoP, apellidoM,
            tipoTI.tipo_documento_id,
            generarDocumento("TI"),
            es_1.faker.date.birthdate({ min: 5, max: 18, mode: "age" }).toISOString().split("T")[0],
            genero,
            randomItem(gruposSanguineos),
            randomItem(gruposEtnicos),
            randomItem(credos),
            es_1.faker.location.city(),
            es_1.faker.location.city(),
        ], client);
        const persona = personaEstudiante.rows[0];
        // 2. Estudiante
        const estudianteResult = yield (0, database_1.query)(`INSERT INTO estudiantes (persona_id, fecha_ingreso, estado)
       VALUES ($1, $2, 'activo')
       ON CONFLICT DO NOTHING
       RETURNING *`, [persona.persona_id, es_1.faker.date.past({ years: 3 }).toISOString().split("T")[0]], client);
        if (estudianteResult.rows.length === 0)
            continue;
        const estudiante = estudianteResult.rows[0];
        // 3. Usuario del estudiante
        // await crearUsuario(client, persona.persona_id, persona, ids.roleEstudiante)
        // 4. Ficha del estudiante
        yield (0, database_1.query)(`INSERT INTO ficha_estudiante
         (estudiante_id, numero_hermanos, posicion_hermanos, eps_ars, alergia,
          centro_atencion_medica, medio_transporte, transporte_propio, observaciones)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (estudiante_id) DO NOTHING`, [
            estudiante.estudiante_id,
            es_1.faker.number.int({ min: 0, max: 5 }),
            es_1.faker.number.int({ min: 1, max: 5 }),
            randomItem(eps),
            es_1.faker.datatype.boolean(0.3) ? es_1.faker.lorem.words(3) : null,
            es_1.faker.company.name() + " Clínica",
            randomItem(tiposTransporte),
            es_1.faker.datatype.boolean(0.3),
            es_1.faker.datatype.boolean(0.2) ? es_1.faker.lorem.sentence() : null,
        ], client);
        // 5. Vivienda
        const materialesParedes = ["Ladrillo", "Bloque", "Madera", "Bahareque", "Adobe"];
        const materalesTecho = ["Zinc", "Concreto", "Palma", "Eternit", "Teja"];
        const materialesPisos = ["Cerámica", "Cemento", "Madera", "Baldosa", "Tierra"];
        yield (0, database_1.query)(`INSERT INTO vivienda_estudiante
         (estudiante_id, tipo_paredes, tipo_techo, tipo_pisos, num_banos, num_cuartos)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (estudiante_id) DO NOTHING`, [
            estudiante.estudiante_id,
            randomItem(materialesParedes),
            randomItem(materalesTecho),
            randomItem(materialesPisos),
            es_1.faker.number.int({ min: 1, max: 3 }),
            es_1.faker.number.int({ min: 2, max: 6 }),
        ], client);
        // 6. Acudiente
        const personaAcudiente = yield crearPersona(client, tipoCC.tipo_documento_id);
        const acudienteResult = yield (0, database_1.query)(`INSERT INTO acudientes (persona_id, parentesco, ocupacion, nivel_estudio)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING
       RETURNING *`, [
            personaAcudiente.persona_id,
            randomItem(["Padre", "Madre", "Abuelo", "Abuela", "Tío", "Tía", "Hermano mayor"]),
            es_1.faker.person.jobTitle(),
            randomItem(["Primaria", "Bachillerato", "Técnico", "Tecnólogo", "Universitario"]),
        ], client);
        if (acudienteResult.rows.length > 0) {
            const acudiente = acudienteResult.rows[0];
            yield (0, database_1.query)(`INSERT INTO acudiente_estudiante
           (estudiante_id, acudiente_id, tipo_relacion, es_principal)
         VALUES ($1,$2,$3,true)
         ON CONFLICT DO NOTHING`, [estudiante.estudiante_id, acudiente.acudiente_id, "familiar"], client);
            // Contacto del acudiente
            yield (0, database_1.query)(`INSERT INTO contactos (persona_id, tipo_contacto, valor, es_principal, activo)
         VALUES ($1,'celular',$2,true,true)
         ON CONFLICT DO NOTHING`, [personaAcudiente.persona_id, es_1.faker.phone.number({ style: "human" })], client);
        }
        // 7. Matrícula en el período activo
        const curso = randomItem(cursosDisponibles);
        const jornada = randomItem(ids.jornadas);
        yield (0, database_1.query)(`INSERT INTO matriculas
           (estudiante_id, curso_id, jornada_id, periodo_id, estado)
         VALUES ($1,$2,$3,$4,'activa')
         ON CONFLICT (estudiante_id, periodo_id) DO NOTHING`, [estudiante.estudiante_id, curso.curso_id, jornada.jornada_id, periodoId], client);
    }
    console.log("  ✓ 30 estudiantes creados con ficha, vivienda, acudiente y matrícula");
});
// -----------------------------------------------------------------------------
// PERÍODO DE MATRÍCULA ACTIVO
// -----------------------------------------------------------------------------
const seedPeriodoMatricula = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const anio = new Date().getFullYear();
    // Buscar período existente para este año
    const existing = yield (0, database_1.query)(`SELECT periodo_id FROM periodos_matricula WHERE anio = $1 LIMIT 1`, [anio], client);
    if (existing.rows.length > 0) {
        console.log(`  ✓ Período de matrícula ${anio} ya existe — omitido`);
        return existing.rows[0].periodo_id;
    }
    // Primero desactivar cualquier período activo
    yield (0, database_1.query)(`UPDATE periodos_matricula SET activo = false WHERE activo = true`, [], client);
    const result = yield (0, database_1.query)(`INSERT INTO periodos_matricula
       (anio, fecha_inicio, fecha_fin, activo, descripcion)
     VALUES ($1, $2, $3, true, $4)
     RETURNING periodo_id`, [
        anio,
        `${anio}-01-15`, // Matrícula abre en enero
        `${anio}-12-15`, // Cierra en diciembre
        `Período de matrícula ordinaria ${anio}`,
    ], client);
    console.log(`  ✓ Período de matrícula ${anio} creado y activado`);
    return result.rows[0].periodo_id;
});
// -----------------------------------------------------------------------------
// ENTRY POINT
// -----------------------------------------------------------------------------
const runFakerSeed = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("\n🌱 Ejecutando seed de datos falsos (faker)...\n");
    console.log("  ℹ  Todos los usuarios tendrán contraseña: Test123!\n");
    // Hashear contraseña por defecto una sola vez
    hashedDefaultPassword = yield bcryptjs_1.default.hash("Test123!", 12);
    try {
        yield (0, database_1.transaction)((client) => __awaiter(void 0, void 0, void 0, function* () {
            const ids = yield getIds(client);
            if (ids.tiposDoc.length === 0) {
                throw new Error("No hay tipos de documento en la BD. Ejecuta seed.default.ts primero.");
            }
            const periodoId = yield seedPeriodoMatricula(client);
            const profesores = yield seedProfesores(client, ids);
            yield seedAdministrativos(client, ids);
            yield seedEstudiantes(client, ids, periodoId);
        }));
        console.log("\n✅ Seed faker completado");
        console.log("   Credenciales de prueba: cualquier usuario / Test123!\n");
        process.exit(0);
    }
    catch (error) {
        console.error("\n❌ Error ejecutando seed faker:", error);
        process.exit(1);
    }
});
runFakerSeed();
//# sourceMappingURL=seed.faker.js.map