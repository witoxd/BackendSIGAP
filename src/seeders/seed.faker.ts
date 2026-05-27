import { query, transaction } from "../config/database"
import { faker } from "@faker-js/faker/locale/es"

// =============================================================================
// SEED FAKER — datos realistas para desarrollo y pruebas
//
// Depende de seed.default.ts — ejecutar ese primero.
// Idempotente: limpia todos los datos de ejecuciones anteriores antes de insertar.
//
// Uso:
//   npm run seed:FakeData
// =============================================================================

faker.seed(42)

// ============================================================
// CONFIGURACIÓN — ajusta estas constantes antes de ejecutar
// ============================================================
const CONFIG = {
  SEED:                     42,
  NUM_ESTUDIANTES:          80,
  NUM_PROFESORES:           15,
  NUM_ADMINISTRATIVOS:      5,
  ANIO_INICIO:              2020,
  ANIO_FIN:                 2024,
  GRADOS_INICIALES:         ["6°", "7°", "8°", "9°"],   // grados posibles al ingresar
  GRUPOS:                   ["A"],                        // grupos disponibles en seed.default
  PCT_HERMANOS:             0.20,                         // fracción de estudiantes que comparten acudiente
  PROB_REPROBADO:           0.12,
  PROB_RETIRADO:            0.05,
  PROB_TRASLADADO:          0.03,
  PROB_EXPULSADO:           0.02,
  PROB_SUSPENSION:          0.18,
  MAX_SUSPENSIONES:         3,
  COLEGIOS_PREVIOS_MAX:     3,
  CONTACTOS_EMERGENCIA_MAX: 2,
} as const

// ============================================================
// TIPOS INTERNOS
// ============================================================
type ResultadoAnio = "promovido" | "reprobado" | "retirado" | "trasladado" | "expulsado"

interface TramoMatricula {
  anio:          number
  grado:         string
  resultado:     ResultadoAnio
  matricula_id?: number
}

interface EstudianteGenerado {
  estudiante_id: number
  persona_id:    number
  apellido_p:    string
  tramos:        TramoMatricula[]
  estado_final:  "activo" | "inactivo" | "graduado" | "suspendido" | "expulsado"
}

interface AcudienteGenerado {
  acudiente_id:  number
  persona_id:    number
  apellido_p:    string
}

interface ProfesorGenerado {
  profesor_id: number
  docente_id:  number
}

// ============================================================
// CATÁLOGOS LOCALES
// ============================================================
const GRADOS_ORDEN = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°"]

const GRUPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const GENEROS           = ["Masculino", "Femenino"] as const
const TIPOS_TRANSPORTE  = ["Bus", "Moto", "A pie", "Bicicleta", "Carro particular"]
const EPS               = ["Sura", "Sanitas", "Nueva EPS", "Compensar", "Coosalud", "Cajacopi"]
const CREDOS            = ["Católico", "Cristiano", "Evangélico", "Ninguno", "Otro"]
const GRUPOS_ETNICOS    = ["Mestizo", "Afrocolombiano", "Indígena", "Wayuu", "Ninguno"]
const SEDES             = ["Principal", "Sede Norte", "Sede Sur"]
const MUNICIPIOS_CO     = [
  "Riohacha", "Maicao", "Uribia", "Manaure", "Fonseca",
  "Barranquilla", "Cartagena", "Santa Marta", "Valledupar", "Montería",
]
const TITULOS_DOCENTE   = [
  "Licenciatura en Matemáticas",
  "Licenciatura en Lengua Castellana",
  "Licenciatura en Ciencias Naturales",
  "Licenciatura en Ciencias Sociales",
  "Licenciatura en Educación Física",
  "Licenciatura en Inglés",
  "Licenciatura en Informática",
]
const POSGRADOS_DOCENTE = [
  "Especialización en Pedagogía",
  "Especialización en Evaluación Educativa",
  "Maestría en Educación",
  "Maestría en Gestión Educativa",
]
const MATERIAS          = [
  "Matemáticas", "Lengua Castellana", "Ciencias Naturales",
  "Ciencias Sociales", "Inglés", "Educación Física",
  "Tecnología e Informática", "Artística", "Ética y Valores", "Religión",
]
const AREAS_DOCENTE     = [
  "Matemáticas", "Lengua Castellana", "Ciencias Naturales",
  "Ciencias Sociales", "Inglés", "Educación Física",
  "Tecnología e Informática", "Artística",
]
const TIPOS_CONTRATO    = ["En propiedad", "Provisional", "Temporal", "Cátedra"]
const CARGOS_ADMIN      = ["Secretaria", "Coordinador Académico", "Rector", "Tesorero", "Psicólogo"]
const PARENTESCOS_ACUDIENTE = ["Padre", "Madre", "Abuelo", "Abuela", "Tío", "Tía", "Hermano mayor"]
const PARENTESCOS_CONTACTO  = ["Cónyuge", "Hijo/a", "Hermano/a", "Madre", "Padre", "Amigo cercano"]
const NIVEL_ESTUDIO     = ["Primaria", "Bachillerato", "Técnico", "Tecnólogo", "Universitario"]
const MATERIALES_PAREDES = ["Ladrillo", "Bloque", "Madera", "Bahareque", "Adobe"]
const MATERIALES_TECHO   = ["Zinc", "Concreto", "Palma", "Eternit", "Teja"]
const MATERIALES_PISOS   = ["Cerámica", "Cemento", "Madera", "Baldosa", "Tierra"]
const MOTIVOS_SUSPENSION = [
  "Agresión física a compañero",
  "Falta grave de disciplina",
  "Daño a bienes del colegio",
  "Incumplimiento reglamento escolar",
  "Actitud irrespetuosa hacia docente",
]

// ============================================================
// HELPERS
// ============================================================
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(faker.number.float() * arr.length)]

const celularColombia = (): string =>
  `3${faker.number.int({ min: 0, max: 2 })}${faker.string.numeric(8)}`

const telefonoColombia = (): string =>
  `(605) ${faker.string.numeric(7)}`

const siguienteGrado = (grado: string): string | null => {
  const idx = GRADOS_ORDEN.indexOf(grado)
  if (idx === -1 || idx === GRADOS_ORDEN.length - 1) return null
  return GRADOS_ORDEN[idx + 1]
}

const calcularResultadoAnio = (): ResultadoAnio => {
  const r = faker.number.float()
  if (r < CONFIG.PROB_EXPULSADO)                                                      return "expulsado"
  if (r < CONFIG.PROB_EXPULSADO + CONFIG.PROB_RETIRADO)                               return "retirado"
  if (r < CONFIG.PROB_EXPULSADO + CONFIG.PROB_RETIRADO + CONFIG.PROB_TRASLADADO)      return "trasladado"
  if (r < CONFIG.PROB_EXPULSADO + CONFIG.PROB_RETIRADO + CONFIG.PROB_TRASLADADO + CONFIG.PROB_REPROBADO) return "reprobado"
  return "promovido"
}

const generarDocumentoCC = (): string => faker.string.numeric({ length: { min: 8, max: 10 } })
const generarDocumentoTI = (): string => faker.string.numeric({ length: 10 })

// ============================================================
// FASE 0 — LIMPIEZA (idempotencia)
// ============================================================
const limpiarDatos = async (client: any): Promise<void> => {
  console.log("  → Limpiando datos de ejecuciones anteriores...")

  // Orden inverso a las FK: primero los hijos, luego los padres
  const tablas = [
    "reemplazos_profesor",
    "asignacion_docente",
    "director_grupo",
    "suspensiones",
    "egresados",
    "matriculas_historial",
    "matriculas",
    "colegios_anteriores",
    "ficha_estudiante",
    "vivienda_estudiante",
    "acudiente_estudiante",
    "acudientes",
    "estudiantes",
    "profesor_contactos_emergencia",
    "profesores",
    "administrativos",
    "docente",
    "procesos_inscripcion",
    "periodos_matricula",
    "contactos",
  ]

  for (const tabla of tablas) {
    await query(`DELETE FROM ${tabla}`, [], client)
  }

  // Deshabilitar trigger de validación de período activo para poder insertar
  // matrículas históricas (años anteriores al actual)
  await query(`ALTER TABLE matriculas DISABLE TRIGGER trg_verificar_periodo_activo`, [], client)

  // Personas: conservar solo la del admin
  await query(
    `DELETE FROM personas
     WHERE persona_id NOT IN (
       SELECT COALESCE(persona_id, 0)
       FROM usuarios
       WHERE email = 'admin@sigap.edu.co'
     )`,
    [],
    client
  )

  console.log("  ✓ Limpieza completada")
}

// ============================================================
// FASE 1 — CARGAR IDs DE CATÁLOGOS
// ============================================================
interface Catalogos {
  tipoCC:       { tipo_documento_id: number }
  tipoTI:       { tipo_documento_id: number }
  jornadas:     { jornada_id: number }[]
  cursoMap:     Map<string, number>           // "6°-A-{jornada_id}" → curso_id
  decretos:     { decreto_id: number; codigo: string }[]
  gradosMap:    Map<number, { grado_id: number }[]>  // decreto_id → grados
  rolEstudiante: number
  rolProfesor:  number
  rolAdmin:     number
}

const cargarCatalogos = async (client: any): Promise<Catalogos> => {
  const [tiposDoc, jornadas, cursos, roles, decretos, gradosEscalafon] = await Promise.all([
    query(`SELECT tipo_documento_id, tipo_documento FROM tipo_documento`, [], client),
    query(`SELECT jornada_id FROM jornadas`, [], client),
    query(`SELECT curso_id, grado, grupo, jornada_id FROM cursos`, [], client),
    query(`SELECT role_id, nombre FROM roles`, [], client),
    query(`SELECT decreto_id, codigo FROM decretos`, [], client),
    query(`SELECT grado_id, decreto_id FROM grados_escalafon ORDER BY decreto_id, orden`, [], client),
  ])

  if (tiposDoc.rows.length === 0)
    throw new Error("No hay tipos de documento. Ejecuta seed:DefaultData primero.")
  if (jornadas.rows.length === 0)
    throw new Error("No hay jornadas. Ejecuta seed:DefaultData primero.")
  if (cursos.rows.length === 0)
    throw new Error("No hay cursos. Ejecuta seed:DefaultData primero.")

  const cursoMap = new Map<string, number>()
  for (const c of cursos.rows) {
    cursoMap.set(`${c.grado}-${c.grupo}-${c.jornada_id}`, c.curso_id)
  }

  const gradosMap = new Map<number, { grado_id: number }[]>()
  for (const g of gradosEscalafon.rows) {
    if (!gradosMap.has(g.decreto_id)) gradosMap.set(g.decreto_id, [])
    gradosMap.get(g.decreto_id)!.push({ grado_id: g.grado_id })
  }

  const tipoCC = tiposDoc.rows.find((t: any) => t.tipo_documento === "CC")
  const tipoTI = tiposDoc.rows.find((t: any) => t.tipo_documento === "TI")
  if (!tipoCC || !tipoTI) throw new Error("Tipos de documento CC o TI no encontrados.")

  const findRole = (nombre: string) => roles.rows.find((r: any) => r.nombre === nombre)?.role_id as number

  return {
    tipoCC,
    tipoTI,
    jornadas:      jornadas.rows,
    cursoMap,
    decretos:      decretos.rows,
    gradosMap,
    rolEstudiante: findRole("estudiante"),
    rolProfesor:   findRole("profesor"),
    rolAdmin:      findRole("administrativo"),
  }
}

// Helper para obtener curso_id con error explícito si no existe
const getCursoId = (grado: string, grupo: string, jornadaId: number, cursoMap: Map<string, number>): number => {
  const key = `${grado}-${grupo}-${jornadaId}`
  const id = cursoMap.get(key)
  if (!id) throw new Error(`Curso no encontrado en mapa: ${key}. Verifica seed:DefaultData.`)
  return id
}

// ============================================================
// FASE 2 — PERÍODOS DE MATRÍCULA Y PROCESOS DE INSCRIPCIÓN
// ============================================================
const seedPeriodos = async (client: any): Promise<Map<number, number>> => {
  console.log(`  → Creando períodos ${CONFIG.ANIO_INICIO}–${CONFIG.ANIO_FIN}...`)
  const periodoMap = new Map<number, number>() // anio → periodo_id

  for (let anio = CONFIG.ANIO_INICIO; anio <= CONFIG.ANIO_FIN; anio++) {
    const esActual = anio === (CONFIG.ANIO_FIN as number)

    const result = await query(
      `INSERT INTO periodos_matricula (anio, fecha_inicio, fecha_fin, activo, descripcion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING periodo_id`,
      [
        anio,
        `${anio}-01-15`,
        `${anio}-11-30`,
        esActual,
        `Período académico ${anio}`,
      ],
      client
    )
    const periodoId: number = result.rows[0].periodo_id
    periodoMap.set(anio, periodoId)

    // Proceso de inscripción: abre en noviembre del año anterior
    const anioInscripcion = anio - 1
    await query(
      `INSERT INTO procesos_inscripcion
         (periodo_id, nombre, fecha_inicio_inscripcion, fecha_fin_inscripcion, activo)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        periodoId,
        `Matrícula ordinaria ${anio}`,
        `${anioInscripcion}-11-01`,
        `${anioInscripcion}-12-15`,
        !esActual,
      ],
      client
    )
  }

  console.log(`  ✓ ${periodoMap.size} períodos creados`)
  return periodoMap
}

// ============================================================
// FASE 3 — PROFESORES
// ============================================================
const seedProfesores = async (
  client: any,
  cat: Catalogos,
): Promise<ProfesorGenerado[]> => {
  console.log(`  → Creando ${CONFIG.NUM_PROFESORES} profesores...`)
  const profesores: ProfesorGenerado[] = []

  for (let i = 0; i < CONFIG.NUM_PROFESORES; i++) {
    const genero    = pick(GENEROS)
    const sexo      = genero === "Masculino" ? "male" : "female"
    const apellidoP = faker.person.lastName()
    const apellidoM = faker.person.lastName()

    const personaRes = await query(
      `INSERT INTO personas
         (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,
          fecha_nacimiento, genero, grupo_sanguineo, grupo_etnico, credo_religioso,
          lugar_nacimiento, expedida_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING persona_id`,
      [
        faker.person.firstName(sexo),
        apellidoP,
        apellidoM,
        cat.tipoCC.tipo_documento_id,
        generarDocumentoCC(),
        faker.date.birthdate({ min: 25, max: 60, mode: "age" }).toISOString().split("T")[0],
        genero,
        pick(GRUPOS_SANGUINEOS),
        pick(GRUPOS_ETNICOS),
        pick(CREDOS),
        pick(MUNICIPIOS_CO),
        pick(MUNICIPIOS_CO),
      ],
      client
    )
    const personaId: number = personaRes.rows[0].persona_id

    const decreto       = pick(cat.decretos)
    const gradosList    = cat.gradosMap.get(decreto.decreto_id) ?? []
    const gradoEscalafon = gradosList.length > 0 ? pick(gradosList) : null
    const fechaContrato  = faker.date.past({ years: 15, refDate: new Date(`${CONFIG.ANIO_INICIO}-01-01`) })
    const fechaNombramiento = faker.date.between({ from: fechaContrato, to: new Date(`${CONFIG.ANIO_INICIO}-01-01`) })

    const docenteRes = await query(
      `INSERT INTO docente
         (persona_id, sede, jornada_id, tipo_contrato, estado, fecha_contratacion,
          decreto_id, titulo, area, posgrado, grado_escalafon_id, fecha_nombramiento,
          numero_resolucion, perfil_profesional)
       VALUES ($1,$2,$3,$4,'activo',$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING docente_id`,
      [
        personaId,
        pick(SEDES),
        pick(cat.jornadas).jornada_id,
        pick(TIPOS_CONTRATO),
        fechaContrato.toISOString().split("T")[0],
        decreto.decreto_id,
        pick(TITULOS_DOCENTE),
        pick(AREAS_DOCENTE),
        faker.datatype.boolean(0.5) ? pick(POSGRADOS_DOCENTE) : null,
        gradoEscalafon?.grado_id ?? null,
        fechaNombramiento.toISOString().split("T")[0],
        `RES-${fechaNombramiento.getFullYear()}-${faker.string.numeric(5)}`,
        faker.lorem.sentences({ min: 1, max: 2 }),
      ],
      client
    )
    const docenteId: number = docenteRes.rows[0].docente_id

    const profRes = await query(
      `INSERT INTO profesores (docente_id) VALUES ($1) RETURNING profesor_id`,
      [docenteId],
      client
    )
    const profesorId: number = profRes.rows[0].profesor_id

    // Contactos de emergencia (1–2 por profesor)
    const numContactos = faker.number.int({ min: 1, max: CONFIG.CONTACTOS_EMERGENCIA_MAX })
    for (let c = 0; c < numContactos; c++) {
      const sexoContacto = pick(["male", "female"] as const)
      await query(
        `INSERT INTO profesor_contactos_emergencia
           (profesor_id, nombre, parentesco, telefono, celular, activo)
         VALUES ($1,$2,$3,$4,$5,true)`,
        [
          profesorId,
          `${faker.person.firstName(sexoContacto)} ${faker.person.lastName()}`,
          pick(PARENTESCOS_CONTACTO),
          telefonoColombia(),
          faker.datatype.boolean(0.7) ? celularColombia() : null,
        ],
        client
      )
    }

    profesores.push({ profesor_id: profesorId, docente_id: docenteId })
  }

  console.log(`  ✓ ${profesores.length} profesores creados con contactos de emergencia`)
  return profesores
}

// ============================================================
// FASE 4 — ADMINISTRATIVOS
// ============================================================
const seedAdministrativos = async (client: any, cat: Catalogos): Promise<void> => {
  console.log(`  → Creando ${CONFIG.NUM_ADMINISTRATIVOS} administrativos...`)

  for (let i = 0; i < CONFIG.NUM_ADMINISTRATIVOS; i++) {
    const genero = pick(GENEROS)
    const sexo   = genero === "Masculino" ? "male" : "female"

    const personaRes = await query(
      `INSERT INTO personas
         (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,
          fecha_nacimiento, genero, grupo_sanguineo, lugar_nacimiento, expedida_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING persona_id`,
      [
        faker.person.firstName(sexo),
        faker.person.lastName(),
        faker.person.lastName(),
        cat.tipoCC.tipo_documento_id,
        generarDocumentoCC(),
        faker.date.birthdate({ min: 25, max: 60, mode: "age" }).toISOString().split("T")[0],
        genero,
        pick(GRUPOS_SANGUINEOS),
        pick(MUNICIPIOS_CO),
        pick(MUNICIPIOS_CO),
      ],
      client
    )
    const personaId: number = personaRes.rows[0].persona_id

    const docenteRes = await query(
      `INSERT INTO docente (persona_id, estado) VALUES ($1,'activo') RETURNING docente_id`,
      [personaId],
      client
    )
    await query(
      `INSERT INTO administrativos (docente_id, cargo) VALUES ($1,$2)`,
      [docenteRes.rows[0].docente_id, pick(CARGOS_ADMIN)],
      client
    )
  }

  console.log(`  ✓ ${CONFIG.NUM_ADMINISTRATIVOS} administrativos creados`)
}

// ============================================================
// FASE 5 — ESTUDIANTES, FAMILIAS, FICHAS Y TRAYECTORIAS
// ============================================================
const seedEstudiantes = async (
  client:     any,
  cat:        Catalogos,
  periodoMap: Map<number, number>,
): Promise<EstudianteGenerado[]> => {
  console.log(`  → Creando ${CONFIG.NUM_ESTUDIANTES} estudiantes con familias y trayectorias...`)

  const anios = Array.from({ length: CONFIG.ANIO_FIN - CONFIG.ANIO_INICIO + 1 },
    (_, i) => CONFIG.ANIO_INICIO + i)

  // Calcular distribución de familias
  const numConHermanos   = Math.round(CONFIG.NUM_ESTUDIANTES * CONFIG.PCT_HERMANOS / 2)
  const numSinHermanos   = CONFIG.NUM_ESTUDIANTES - numConHermanos * 2
  const estudiantesGen:   EstudianteGenerado[] = []

  // Jornada por defecto (la primera disponible, que es "Mañana" del seed.default)
  const jornadaPrincipal = cat.jornadas[0].jornada_id

  const crearAcudiente = async (apellidoFamilia: string): Promise<AcudienteGenerado> => {
    const genero = pick(GENEROS)
    const sexo   = genero === "Masculino" ? "male" : "female"
    const apellidoM = faker.person.lastName()

    const pRes = await query(
      `INSERT INTO personas
         (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,
          fecha_nacimiento, genero, grupo_sanguineo, grupo_etnico, credo_religioso,
          lugar_nacimiento, expedida_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING persona_id`,
      [
        faker.person.firstName(sexo),
        apellidoFamilia,
        apellidoM,
        cat.tipoCC.tipo_documento_id,
        generarDocumentoCC(),
        faker.date.birthdate({ min: 30, max: 65, mode: "age" }).toISOString().split("T")[0],
        genero,
        pick(GRUPOS_SANGUINEOS),
        pick(GRUPOS_ETNICOS),
        pick(CREDOS),
        pick(MUNICIPIOS_CO),
        pick(MUNICIPIOS_CO),
      ],
      client
    )
    const personaId: number = pRes.rows[0].persona_id

    await query(
      `INSERT INTO contactos (persona_id, tipo_contacto, valor, es_principal, activo)
       VALUES ($1,'celular',$2,true,true)`,
      [personaId, celularColombia()],
      client
    )

    const aRes = await query(
      `INSERT INTO acudientes (persona_id, parentesco, ocupacion, nivel_estudio)
       VALUES ($1,$2,$3,$4)
       RETURNING acudiente_id`,
      [
        personaId,
        pick(PARENTESCOS_ACUDIENTE),
        faker.person.jobTitle(),
        pick(NIVEL_ESTUDIO),
      ],
      client
    )

    return { acudiente_id: aRes.rows[0].acudiente_id, persona_id: personaId, apellido_p: apellidoFamilia }
  }

  const crearEstudiante = async (
    apellidoFamilia: string,
    acudiente1: AcudienteGenerado,
    acudiente2: AcudienteGenerado,
  ): Promise<EstudianteGenerado> => {
    const genero    = pick(GENEROS)
    const sexo      = genero === "Masculino" ? "male" : "female"
    const apellidoM = faker.person.lastName()

    const pRes = await query(
      `INSERT INTO personas
         (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento,
          fecha_nacimiento, genero, grupo_sanguineo, grupo_etnico, credo_religioso,
          lugar_nacimiento, expedida_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING persona_id`,
      [
        faker.person.firstName(sexo),
        apellidoFamilia,
        apellidoM,
        cat.tipoTI.tipo_documento_id,
        generarDocumentoTI(),
        faker.date.birthdate({ min: 10, max: 18, mode: "age" }).toISOString().split("T")[0],
        genero,
        pick(GRUPOS_SANGUINEOS),
        pick(GRUPOS_ETNICOS),
        pick(CREDOS),
        pick(MUNICIPIOS_CO),
        pick(MUNICIPIOS_CO),
      ],
      client
    )
    const personaId: number = pRes.rows[0].persona_id

    const eRes = await query(
      `INSERT INTO estudiantes (persona_id, fecha_ingreso, estado)
       VALUES ($1,$2,'activo')
       RETURNING estudiante_id`,
      [personaId, `${CONFIG.ANIO_INICIO}-02-01`],
      client
    )
    const estudianteId: number = eRes.rows[0].estudiante_id

    // Ficha del estudiante
    await query(
      `INSERT INTO ficha_estudiante
         (estudiante_id, numero_hermanos, posicion_hermanos, eps_ars, alergia,
          centro_atencion_medica, medio_transporte, transporte_propio, observaciones)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        estudianteId,
        faker.number.int({ min: 0, max: 5 }),
        faker.number.int({ min: 1, max: 5 }),
        pick(EPS),
        faker.datatype.boolean(0.25) ? faker.lorem.words(3) : null,
        `Clínica ${faker.company.name()}`,
        pick(TIPOS_TRANSPORTE),
        faker.datatype.boolean(0.25),
        faker.datatype.boolean(0.15) ? faker.lorem.sentence() : null,
      ],
      client
    )

    // Vivienda
    await query(
      `INSERT INTO vivienda_estudiante
         (estudiante_id, tipo_paredes, tipo_techo, tipo_pisos, num_banos, num_cuartos)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        estudianteId,
        pick(MATERIALES_PAREDES),
        pick(MATERIALES_TECHO),
        pick(MATERIALES_PISOS),
        faker.number.int({ min: 1, max: 3 }),
        faker.number.int({ min: 2, max: 6 }),
      ],
      client
    )

    // Colegios anteriores (0–max, solo si empezó desde antes del primer año)
    const numColegios = faker.number.int({ min: 0, max: CONFIG.COLEGIOS_PREVIOS_MAX })
    for (let c = 0; c < numColegios; c++) {
      const anioColAnterior = CONFIG.ANIO_INICIO - faker.number.int({ min: 1, max: 3 })
      await query(
        `INSERT INTO colegios_anteriores
           (estudiante_id, nombre_colegio, ciudad, grado_cursado, anio, orden)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          estudianteId,
          `Institución Educativa ${faker.company.name()}`,
          pick(MUNICIPIOS_CO),
          pick(CONFIG.GRADOS_INICIALES),
          anioColAnterior,
          c + 1,
        ],
        client
      )
    }

    // Vincular los dos acudientes
    await query(
      `INSERT INTO acudiente_estudiante (estudiante_id, acudiente_id, tipo_relacion, es_principal)
       VALUES ($1,$2,'familiar',true)`,
      [estudianteId, acudiente1.acudiente_id],
      client
    )
    await query(
      `INSERT INTO acudiente_estudiante (estudiante_id, acudiente_id, tipo_relacion, es_principal)
       VALUES ($1,$2,'familiar',false)`,
      [estudianteId, acudiente2.acudiente_id],
      client
    )

    // ---- Trayectoria académica ----
    const gradoInicial = pick(CONFIG.GRADOS_INICIALES as readonly string[])
    let   gradoActual  = gradoInicial
    const tramos:      TramoMatricula[] = []
    let   terminado    = false

    for (const anio of anios) {
      if (terminado) break

      const periodoId = periodoMap.get(anio)!
      const cursoId   = getCursoId(gradoActual, CONFIG.GRUPOS[0], jornadaPrincipal, cat.cursoMap)
      const esUltimoAnio = anio === CONFIG.ANIO_FIN

      // El último año siempre queda activa (no le calculamos resultado todavía)
      const resultado: ResultadoAnio = esUltimoAnio ? "promovido" : calcularResultadoAnio()

      const estadoMatricula =
        resultado === "retirado" || resultado === "trasladado" || resultado === "expulsado"
          ? "retirada"
          : esUltimoAnio
          ? "activa"
          : "finalizada"

      const motivoRetiro =
        resultado === "expulsado"   ? "Expulsión disciplinaria" :
        resultado === "retirado"    ? "Retiro voluntario"       :
        resultado === "trasladado"  ? "Traslado a otra institución" :
        null

      const fechaMatricula = new Date(`${anio}-02-${faker.number.int({ min: 1, max: 15 })}`)
      const fechaRetiro =
        motivoRetiro
          ? new Date(`${anio}-${faker.number.int({ min: 3, max: 10 })}-${faker.number.int({ min: 1, max: 28 })}`)
          : null

      const mRes = await query(
        `INSERT INTO matriculas
           (estudiante_id, curso_id, periodo_id, fecha_matricula, estado, fecha_retiro, motivo_retiro)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING matricula_id`,
        [
          estudianteId,
          cursoId,
          periodoId,
          fechaMatricula.toISOString().split("T")[0],
          estadoMatricula,
          fechaRetiro ? fechaRetiro.toISOString().split("T")[0] : null,
          motivoRetiro,
        ],
        client
      )

      tramos.push({ anio, grado: gradoActual, resultado: esUltimoAnio ? "promovido" : resultado, matricula_id: mRes.rows[0].matricula_id })

      if (resultado === "expulsado" || resultado === "retirado" || resultado === "trasladado") {
        terminado = true
      } else if (!esUltimoAnio) {
        if (resultado === "promovido") {
          const next = siguienteGrado(gradoActual)
          if (!next) {
            // Completó 11° → egresado
            terminado = true
          } else {
            gradoActual = next
          }
        }
        // reprobado → mismo grado (gradoActual no cambia)
      }

      // Verificar graduación: si llegó a 11° y fue promovido en año no final
      if (!esUltimoAnio && resultado === "promovido" && gradoActual === "11°" && !terminado) {
        // Ya calculamos el next=null arriba, terminado=true
      }
    }

    // Estado final del estudiante
    const ultimoTramo      = tramos[tramos.length - 1]
    let   estadoFinalEst:  EstudianteGenerado["estado_final"] = "activo"

    if (!ultimoTramo) {
      estadoFinalEst = "activo"
    } else if (ultimoTramo.resultado === "expulsado") {
      estadoFinalEst = "expulsado"
    } else if (ultimoTramo.resultado === "retirado" || ultimoTramo.resultado === "trasladado") {
      estadoFinalEst = "inactivo"
    } else if (ultimoTramo.grado === "11°" && ultimoTramo.resultado === "promovido" && ultimoTramo.anio < CONFIG.ANIO_FIN) {
      estadoFinalEst = "graduado"
    } else {
      estadoFinalEst = "activo"
    }

    // Actualizar estado del estudiante
    await query(
      `UPDATE estudiantes SET estado = $1 WHERE estudiante_id = $2`,
      [estadoFinalEst, estudianteId],
      client
    )

    // Egresado si corresponde
    if (estadoFinalEst === "graduado") {
      const anioGrado = ultimoTramo.anio
      await query(
        `INSERT INTO egresados (estudiante_id, fecha_grado) VALUES ($1,$2)`,
        [estudianteId, `${anioGrado}-11-20`],
        client
      )
    }

    return { estudiante_id: estudianteId, persona_id: personaId, apellido_p: apellidoFamilia, tramos, estado_final: estadoFinalEst }
  }

  // ---- Generar familias ----

  // Familias con hermanos (2 hijos comparten los mismos 2 acudientes)
  for (let f = 0; f < numConHermanos; f++) {
    const apellido   = faker.person.lastName()
    const acudiente1 = await crearAcudiente(apellido)
    const acudiente2 = await crearAcudiente(faker.person.lastName())
    const hijo1      = await crearEstudiante(apellido, acudiente1, acudiente2)
    const hijo2      = await crearEstudiante(apellido, acudiente1, acudiente2)
    estudiantesGen.push(hijo1, hijo2)
  }

  // Familias con un solo hijo
  for (let f = 0; f < numSinHermanos; f++) {
    const apellido   = faker.person.lastName()
    const acudiente1 = await crearAcudiente(apellido)
    const acudiente2 = await crearAcudiente(faker.person.lastName())
    const hijo       = await crearEstudiante(apellido, acudiente1, acudiente2)
    estudiantesGen.push(hijo)
  }

  console.log(`  ✓ ${estudiantesGen.length} estudiantes creados`)
  return estudiantesGen
}

// ============================================================
// FASE 6 — SUSPENSIONES
// ============================================================
const seedSuspensiones = async (
  client:    any,
  estudiantes: EstudianteGenerado[],
): Promise<void> => {
  console.log("  → Generando suspensiones aleatorias...")
  let total = 0

  for (const est of estudiantes) {
    if (!faker.datatype.boolean(CONFIG.PROB_SUSPENSION)) continue

    // Solo suspender en tramos activos/finalizados (no expulsados/retirados)
    const tramosValidos = est.tramos.filter(
      t => t.resultado !== "expulsado" && t.resultado !== "retirado" && t.resultado !== "trasladado"
    )
    if (tramosValidos.length === 0 || !tramosValidos[0].matricula_id) continue

    const numSuspensiones = faker.number.int({ min: 1, max: CONFIG.MAX_SUSPENSIONES })

    for (let s = 0; s < numSuspensiones; s++) {
      const tramo       = pick(tramosValidos)
      const fechaInicio = new Date(`${tramo.anio}-${faker.number.int({ min: 3, max: 9 })}-${faker.number.int({ min: 1, max: 20 })}`)
      const diasSuspension = faker.number.int({ min: 1, max: 5 })
      const fechaFin    = new Date(fechaInicio)
      fechaFin.setDate(fechaFin.getDate() + diasSuspension)

      await query(
        `INSERT INTO suspensiones
           (estudiante_id, matricula_id, motivo, fecha_inicio, fecha_fin)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          est.estudiante_id,
          tramo.matricula_id ?? null,
          pick(MOTIVOS_SUSPENSION),
          fechaInicio.toISOString().split("T")[0],
          fechaFin.toISOString().split("T")[0],
        ],
        client
      )
      total++
    }
  }

  console.log(`  ✓ ${total} suspensiones generadas`)
}

// ============================================================
// FASE 7 — ASIGNACIONES DOCENTES, DIRECTORES Y REEMPLAZOS
// ============================================================
const seedAsignaciones = async (
  client:     any,
  cat:        Catalogos,
  profesores: ProfesorGenerado[],
  periodoMap: Map<number, number>,
): Promise<void> => {
  console.log("  → Generando asignaciones docentes y directores de grupo...")

  const jornadaPrincipal = cat.jornadas[0].jornada_id
  const cursosDisponibles: { curso_id: number; grado: string }[] = []

  for (const grado of GRADOS_ORDEN) {
    const cursoId = cat.cursoMap.get(`${grado}-${CONFIG.GRUPOS[0]}-${jornadaPrincipal}`)
    if (cursoId) cursosDisponibles.push({ curso_id: cursoId, grado })
  }

  for (const [_anio, periodoId] of periodoMap.entries()) {
    // Director de grupo: un profesor por curso por período
    const profesoresShuffled = [...profesores].sort(() => faker.number.float() - 0.5)

    for (let i = 0; i < cursosDisponibles.length; i++) {
      const curso    = cursosDisponibles[i]
      const profesor = profesoresShuffled[i % profesoresShuffled.length]

      await query(
        `INSERT INTO director_grupo (curso_id, periodo_id, profesor_id)
         VALUES ($1,$2,$3)
         ON CONFLICT DO NOTHING`,
        [curso.curso_id, periodoId, profesor.profesor_id],
        client
      )

      // Asignaciones: cada profesor enseña 1–2 materias en el curso que dirige
      const numMaterias = faker.number.int({ min: 1, max: 2 })
      const materiasUsadas = new Set<string>()

      for (let m = 0; m < numMaterias; m++) {
        let materia = pick(MATERIAS)
        let intentos = 0
        while (materiasUsadas.has(materia) && intentos < 10) {
          materia = pick(MATERIAS)
          intentos++
        }
        if (materiasUsadas.has(materia)) continue
        materiasUsadas.add(materia)

        await query(
          `INSERT INTO asignacion_docente
             (curso_id, profesor_id, periodo_id, materia, horas_semanales)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT DO NOTHING`,
          [
            curso.curso_id,
            profesor.profesor_id,
            periodoId,
            materia,
            faker.number.int({ min: 2, max: 5 }),
          ],
          client
        )
      }
    }

    // Asignaciones adicionales: otros profesores cubren materias restantes en cursos aleatorios
    for (const profesor of profesores) {
      const numCursosExtra = faker.number.int({ min: 1, max: 3 })
      for (let c = 0; c < numCursosExtra; c++) {
        const curso   = pick(cursosDisponibles)
        const materia = pick(MATERIAS)

        await query(
          `INSERT INTO asignacion_docente
             (curso_id, profesor_id, periodo_id, materia, horas_semanales)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT DO NOTHING`,
          [
            curso.curso_id,
            profesor.profesor_id,
            periodoId,
            materia,
            faker.number.int({ min: 2, max: 4 }),
          ],
          client
        )
      }
    }
  }

  // Reemplazos: ~30% de los profesores tiene 1–2 reemplazos en algún período
  console.log("  → Generando reemplazos de profesores...")
  let totalReemplazos = 0
  const aniosList = Array.from(periodoMap.keys())

  for (const profesor of profesores) {
    if (!faker.datatype.boolean(0.30)) continue

    const numReemplazos = faker.number.int({ min: 1, max: 2 })
    for (let r = 0; r < numReemplazos; r++) {
      // El reemplazante es otro profesor distinto
      const reemplazantes = profesores.filter(p => p.profesor_id !== profesor.profesor_id)
      if (reemplazantes.length === 0) continue
      const reemplazante = pick(reemplazantes)

      const anio       = pick(aniosList)
      const fechaInicio = new Date(`${anio}-${faker.number.int({ min: 3, max: 9 })}-${faker.number.int({ min: 1, max: 15 })}`)
      const fechaFin    = new Date(fechaInicio)
      fechaFin.setDate(fechaFin.getDate() + faker.number.int({ min: 5, max: 30 }))

      await query(
        `INSERT INTO reemplazos_profesor
           (profesor_id, reemplaza_a_profesor_id, fecha_inicio, fecha_fin, motivo)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          reemplazante.profesor_id,
          profesor.profesor_id,
          fechaInicio.toISOString().split("T")[0],
          fechaFin.toISOString().split("T")[0],
          pick(["Incapacidad médica", "Permiso sindical", "Capacitación docente", "Licencia de maternidad"]),
        ],
        client
      )
      totalReemplazos++
    }
  }

  console.log(`  ✓ Asignaciones y directores generados`)
  console.log(`  ✓ ${totalReemplazos} reemplazos generados`)
}

// ============================================================
// ENTRY POINT
// ============================================================
const runFakerSeed = async () => {
  console.log("\n🌱 Ejecutando seed de datos falsos (faker)...\n")
  console.log(`   Configuración: ${CONFIG.NUM_ESTUDIANTES} estudiantes | ${CONFIG.NUM_PROFESORES} profesores`)
  console.log(`   Períodos:      ${CONFIG.ANIO_INICIO} – ${CONFIG.ANIO_FIN}`)
  console.log(`   Faker seed:    ${CONFIG.SEED}\n`)

  try {
    await transaction(async (client) => {
      await limpiarDatos(client)

      const cat        = await cargarCatalogos(client)
      const periodoMap = await seedPeriodos(client)
      const profesores = await seedProfesores(client, cat)

      await seedAdministrativos(client, cat)

      const estudiantes = await seedEstudiantes(client, cat, periodoMap)

      await seedSuspensiones(client, estudiantes)
      await seedAsignaciones(client, cat, profesores, periodoMap)

      // Rehabilitar trigger antes de cerrar la transacción
      await query(`ALTER TABLE matriculas ENABLE TRIGGER trg_verificar_periodo_activo`, [], client)
    })

    console.log("\n✅ Seed faker completado exitosamente")
    console.log("─────────────────────────────────────────")
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error ejecutando seed faker:", error)
    process.exit(1)
  }
}

runFakerSeed()
