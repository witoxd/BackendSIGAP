import { query, transaction } from "../config/database"
import bcrypt from "bcryptjs"
import { faker } from "@faker-js/faker/locale/es"

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

faker.seed(42) // Seed fijo para reproducibilidad — mismo resultado cada ejecución

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

const gruposSanguineos = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const generos          = ["Masculino", "Femenino"] as const
const tiposTransporte  = ["Bus", "Moto", "A pie", "Bicicleta", "Carro particular"]
const eps              = ["Sura", "Sanitas", "Nueva EPS", "Compensar", "Coosalud", "Cajacopi"]
const credos           = ["Católico", "Cristiano", "Evangélico", "Ninguno", "Otro"]
const gruposEtnicos    = ["Mestizo", "Afrocolombiano", "Indígena", "Ninguno"]
const sedes            = ["Principal", "Sede Norte", "Sede Sur", "Sede Rural", "Sede Centro"]
const titulos          = [
  "Licenciatura en Matemáticas",
  "Licenciatura en Lengua Castellana",
  "Licenciatura en Ciencias Naturales",
  "Licenciatura en Ciencias Sociales",
  "Licenciatura en Educación Física",
  "Licenciatura en Inglés",
  "Licenciatura en Preescolar",
]
const posgrados        = [
  "Especialización en Pedagogía",
  "Especialización en Evaluación Educativa",
  "Maestría en Educación",
  "Maestría en Gestión Educativa",
  "Especialización en TIC para la Enseñanza",
]
const gradosEscalafon  = ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C", "14"]
const cargosProfesor   = ["Docente de aula", "Director de grupo", "Coordinador de área"]
const areasProfesor    = [
  "Matemáticas",
  "Lengua Castellana",
  "Ciencias Naturales",
  "Ciencias Sociales",
  "Inglés",
  "Educación Física",
  "Tecnología e Informática",
  "Artística",
]
const tiposContratoProfesor = ["En propiedad", "Provisional", "Temporal", "Cátedra"]

const randomItem = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
// Genera un número de documento
const generarDocumento = (tipo: "CC" | "TI" | "RC"): string => {
  if (tipo === "CC") return faker.string.numeric({ length: { min: 8, max: 10 } })
  if (tipo === "TI") return faker.string.numeric({ length: 10 })
  return faker.string.numeric({ length: 11 })
}

// Genera un username único a partir del nombre
const generarUsername = (nombres: string, apellido: string): string => {
  const base = `${nombres.split(" ")[0].toLowerCase()}.${apellido.toLowerCase()}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]/g, "")
  return `${base}${faker.string.numeric(3)}`
}

// Contraseña hasheada por defecto para todos los usuarios de prueba
let hashedDefaultPassword: string

// -----------------------------------------------------------------------------
// OBTENER IDs de tablas ya pobladas por seed.default
// -----------------------------------------------------------------------------
const getIds = async (client: any) => {
  const [tiposDoc, jornadas, cursos, roleProfesor, roleEstudiante, roleAdmin] =
    await Promise.all([
      query(`SELECT tipo_documento_id, tipo_documento FROM tipo_documento`, [], client),
      query(`SELECT jornada_id FROM jornadas`, [], client),
      query(`SELECT curso_id FROM cursos ORDER BY grado`, [], client),
      query(`SELECT role_id FROM roles WHERE nombre = 'profesor'`, [], client),
      query(`SELECT role_id FROM roles WHERE nombre = 'estudiante'`, [], client),
      query(`SELECT role_id FROM roles WHERE nombre = 'administrativo'`, [], client),
    ])

  return {
    tiposDoc:       tiposDoc.rows         as { tipo_documento_id: number; tipo_documento: string }[],
    jornadas:       jornadas.rows         as { jornada_id: number }[],
    cursos:         cursos.rows           as { curso_id: number }[],
    roleProfesor:   roleProfesor.rows[0]?.role_id as number,
    roleEstudiante: roleEstudiante.rows[0]?.role_id as number,
    roleAdmin:      roleAdmin.rows[0]?.role_id as number,
  }
}

// -----------------------------------------------------------------------------
// CREAR PERSONA — base de todos los roles
// -----------------------------------------------------------------------------
const crearPersona = async (
  client: any,
  tipoDocId: number,
  overrides: Partial<{
    nombres:    string
    apellido_p: string
    apellido_m: string
    genero:     "Masculino" | "Femenino"
    doc:        string
  }> = {}
) => {
  const genero    = overrides.genero    || randomItem(generos)
  const sexo      = genero === "Masculino" ? "male" : "female"
  const nombres   = overrides.nombres   ?? faker.person.firstName(sexo)
  const apellidoP = overrides.apellido_p ?? faker.person.lastName()
  const apellidoM = overrides.apellido_m ?? faker.person.lastName()
  const doc       = overrides.doc       ?? generarDocumento("CC")

  const result = await query(
    `INSERT INTO personas
       (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,
        fecha_nacimiento, genero, grupo_sanguineo, grupo_etnico, credo_religioso,
        lugar_nacimiento, expedida_en)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (numero_documento) DO UPDATE
       SET nombres = EXCLUDED.nombres
     RETURNING *`,
    [
      nombres, apellidoP, apellidoM, tipoDocId, doc,
      faker.date.birthdate({ min: 20, max: 60, mode: "age" }).toISOString().split("T")[0],
      genero,
      randomItem(gruposSanguineos),
      randomItem(gruposEtnicos),
      randomItem(credos),
      faker.location.city(),
      faker.location.city(),
    ],
    client
  )
  return result.rows[0]
}

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
const seedProfesores = async (client: any, ids: Awaited<ReturnType<typeof getIds>>) => {
  console.log("  → Creando 5 profesores...")
  const tipoCC = ids.tiposDoc.find(t => t.tipo_documento === "CC")!

  const profesores: any[] = []

  for (let i = 0; i < 5; i++) {
    const persona = await crearPersona(client, tipoCC.tipo_documento_id)
    const fechaContratacion = faker.date.past({ years: 10 })
    const fechaNombramiento = faker.date.between({
      from: fechaContratacion,
      to: new Date(),
    })
    const titulo = randomItem(titulos)
    const area = randomItem(areasProfesor)
    const tienePosgrado = faker.datatype.boolean(0.6)

    // await crearUsuario(client, persona.persona_id, persona, ids.roleProfesor)

    const profResult = await query(
      `INSERT INTO profesores
         (persona_id, fecha_contratacion, fecha_nombramiento, numero_resolucion,
          estado, jornada_id, sede, titulo, perfil_profesional, posgrado,
          grado_escalafon, cargo, area, tipo_contrato)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [
        persona.persona_id,
        fechaContratacion.toISOString().split("T")[0],
        fechaNombramiento.toISOString().split("T")[0],
        `RES-${faker.date.between({ from: fechaNombramiento, to: new Date() }).getFullYear()}-${faker.string.numeric(5)}`,
        "activo",
        randomItem(ids.jornadas).jornada_id,
        randomItem(sedes),
        titulo,
        faker.lorem.sentences({ min: 1, max: 2 }),
        tienePosgrado ? randomItem(posgrados) : null,
        randomItem(gradosEscalafon),
        randomItem(cargosProfesor),
        area,
        randomItem(tiposContratoProfesor),
      ],
      client
    )

    if (profResult.rows.length > 0) profesores.push(profResult.rows[0])
  }

  console.log(`  ✓ ${profesores.length} profesores creados`)
  return profesores
}

// -----------------------------------------------------------------------------
// SEED ADMINISTRATIVOS
// -----------------------------------------------------------------------------
const seedAdministrativos = async (client: any, ids: Awaited<ReturnType<typeof getIds>>) => {
  console.log("  → Creando 3 administrativos...")
  const tipoCC = ids.tiposDoc.find(t => t.tipo_documento === "CC")!

  const cargos = ["Secretaria", "Coordinador Académico", "Rector", "Tesorero", "Psicólogo"]

  for (let i = 0; i < 3; i++) {
    const persona = await crearPersona(client, tipoCC.tipo_documento_id)
    // await crearUsuario(client, persona.persona_id, persona, ids.roleAdmin)

    await query(
      `INSERT INTO administrativos (persona_id, cargo, estado)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [persona.persona_id, randomItem(cargos), true],
      client
    )
  }

  console.log("  ✓ 3 administrativos creados")
}

// -----------------------------------------------------------------------------
// SEED ESTUDIANTES con ficha, vivienda y acudiente
// -----------------------------------------------------------------------------
const seedEstudiantes = async (
  client: any,
  ids: Awaited<ReturnType<typeof getIds>>,
  periodoId: number,
) => {
  console.log("  → Creando 30 estudiantes con ficha, vivienda y acudiente...")

  const tipoCC = ids.tiposDoc.find(t => t.tipo_documento === "CC")!
  const tipoTI = ids.tiposDoc.find(t => t.tipo_documento === "TI")!

  const cursosDisponibles = [...ids.cursos]

  for (let i = 0; i < 30; i++) {
    // 1. Persona del estudiante (usa TI para menores)
    const genero  = randomItem(generos)
    const sexo    = genero === "Masculino" ? "male" : "female"
    const nombres = faker.person.firstName(sexo)
    const apellidoP = faker.person.lastName()
    const apellidoM = faker.person.lastName()

    const personaEstudiante = await query(
      `INSERT INTO personas
         (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,
          fecha_nacimiento, genero, grupo_sanguineo, grupo_etnico, credo_religioso,
          lugar_nacimiento, expedida_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (numero_documento) DO UPDATE SET nombres = EXCLUDED.nombres
       RETURNING *`,
      [
        nombres, apellidoP, apellidoM,
        tipoTI.tipo_documento_id,
        generarDocumento("TI"),
        faker.date.birthdate({ min: 5, max: 18, mode: "age" }).toISOString().split("T")[0],
        genero,
        randomItem(gruposSanguineos),
        randomItem(gruposEtnicos),
        randomItem(credos),
        faker.location.city(),
        faker.location.city(),
      ],
      client
    )
    const persona = personaEstudiante.rows[0]

    // 2. Estudiante
    const estudianteResult = await query(
      `INSERT INTO estudiantes (persona_id, fecha_ingreso, estado)
       VALUES ($1, $2, 'activo')
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [persona.persona_id, faker.date.past({ years: 3 }).toISOString().split("T")[0]],
      client
    )
    if (estudianteResult.rows.length === 0) continue
    const estudiante = estudianteResult.rows[0]

    // 3. Usuario del estudiante
    // await crearUsuario(client, persona.persona_id, persona, ids.roleEstudiante)

    // 4. Ficha del estudiante
    await query(
      `INSERT INTO ficha_estudiante
         (estudiante_id, numero_hermanos, posicion_hermanos, eps_ars, alergia,
          centro_atencion_medica, medio_transporte, transporte_propio, observaciones)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (estudiante_id) DO NOTHING`,
      [
        estudiante.estudiante_id,
        faker.number.int({ min: 0, max: 5 }),
        faker.number.int({ min: 1, max: 5 }),
        randomItem(eps),
        faker.datatype.boolean(0.3) ? faker.lorem.words(3) : null,
        faker.company.name() + " Clínica",
        randomItem(tiposTransporte),
        faker.datatype.boolean(0.3),
        faker.datatype.boolean(0.2) ? faker.lorem.sentence() : null,
      ],
      client
    )

    // 5. Vivienda
    const materialesParedes = ["Ladrillo", "Bloque", "Madera", "Bahareque", "Adobe"]
    const materalesTecho    = ["Zinc", "Concreto", "Palma", "Eternit", "Teja"]
    const materialesPisos   = ["Cerámica", "Cemento", "Madera", "Baldosa", "Tierra"]

    await query(
      `INSERT INTO vivienda_estudiante
         (estudiante_id, tipo_paredes, tipo_techo, tipo_pisos, num_banos, num_cuartos)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (estudiante_id) DO NOTHING`,
      [
        estudiante.estudiante_id,
        randomItem(materialesParedes),
        randomItem(materalesTecho),
        randomItem(materialesPisos),
        faker.number.int({ min: 1, max: 3 }),
        faker.number.int({ min: 2, max: 6 }),
      ],
      client
    )

    // 6. Acudiente
    const personaAcudiente = await crearPersona(client, tipoCC.tipo_documento_id)

    const acudienteResult = await query(
      `INSERT INTO acudientes (persona_id, parentesco, ocupacion, nivel_estudio)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [
        personaAcudiente.persona_id,
        randomItem(["Padre", "Madre", "Abuelo", "Abuela", "Tío", "Tía", "Hermano mayor"]),
        faker.person.jobTitle(),
        randomItem(["Primaria", "Bachillerato", "Técnico", "Tecnólogo", "Universitario"]),
      ],
      client
    )

    if (acudienteResult.rows.length > 0) {
      const acudiente = acudienteResult.rows[0]
      await query(
        `INSERT INTO acudiente_estudiante
           (estudiante_id, acudiente_id, tipo_relacion, es_principal)
         VALUES ($1,$2,$3,true)
         ON CONFLICT DO NOTHING`,
        [estudiante.estudiante_id, acudiente.acudiente_id, "familiar"],
        client
      )

      // Contacto del acudiente
      await query(
        `INSERT INTO contactos (persona_id, tipo_contacto, valor, es_principal, activo)
         VALUES ($1,'celular',$2,true,true)
         ON CONFLICT DO NOTHING`,
        [personaAcudiente.persona_id, faker.phone.number({style: "human"})],
        client
      )
    }

    // 7. Matrícula en el período activo
    const curso    = randomItem(cursosDisponibles)
    const jornada  = randomItem(ids.jornadas)


      await query(
        `INSERT INTO matriculas
           (estudiante_id, curso_id, jornada_id, periodo_id, estado)
         VALUES ($1,$2,$3,$4,'activa')
         ON CONFLICT (estudiante_id, periodo_id) DO NOTHING`,
        [estudiante.estudiante_id, curso.curso_id, jornada.jornada_id, periodoId],
        client
      )
    
  }

  console.log("  ✓ 30 estudiantes creados con ficha, vivienda, acudiente y matrícula")
}

// -----------------------------------------------------------------------------
// PERÍODO DE MATRÍCULA ACTIVO
// -----------------------------------------------------------------------------
const seedPeriodoMatricula = async (client: any): Promise<number> => {
  const anio = new Date().getFullYear()

  // Buscar período existente para este año
  const existing = await query(
    `SELECT periodo_id FROM periodos_matricula WHERE anio = $1 LIMIT 1`,
    [anio],
    client
  )
  if (existing.rows.length > 0) {
    console.log(`  ✓ Período de matrícula ${anio} ya existe — omitido`)
    return existing.rows[0].periodo_id
  }

  // Primero desactivar cualquier período activo
  await query(
    `UPDATE periodos_matricula SET activo = false WHERE activo = true`,
    [],
    client
  )

  const result = await query(
    `INSERT INTO periodos_matricula
       (anio, fecha_inicio, fecha_fin, activo, descripcion)
     VALUES ($1, $2, $3, true, $4)
     RETURNING periodo_id`,
    [
      anio,
      `${anio}-01-15`,  // Matrícula abre en enero
      `${anio}-12-15`,  // Cierra en diciembre
      `Período de matrícula ordinaria ${anio}`,
    ],
    client
  )

  console.log(`  ✓ Período de matrícula ${anio} creado y activado`)
  return result.rows[0].periodo_id
}

// -----------------------------------------------------------------------------
// ENTRY POINT
// -----------------------------------------------------------------------------
const runFakerSeed = async () => {
  console.log("\n🌱 Ejecutando seed de datos falsos (faker)...\n")
  console.log("  ℹ  Todos los usuarios tendrán contraseña: Test123!\n")

  // Hashear contraseña por defecto una sola vez
  hashedDefaultPassword = await bcrypt.hash("Test123!", 12)

  try {
    await transaction(async (client) => {
      const ids = await getIds(client)

      if (ids.tiposDoc.length === 0) {
        throw new Error(
          "No hay tipos de documento en la BD. Ejecuta seed.default.ts primero."
        )
      }

      const periodoId = await seedPeriodoMatricula(client)
       const profesores = await seedProfesores(client, ids)
      await seedAdministrativos(client, ids)
      await seedEstudiantes(client, ids, periodoId)
    })

    console.log("\n✅ Seed faker completado")
    console.log("   Credenciales de prueba: cualquier usuario / Test123!\n")
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error ejecutando seed faker:", error)
    process.exit(1)
  }
}

runFakerSeed()
