import { query, transaction } from "../config/database"
import bcrypt from "bcryptjs"

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
const seedRoles = async (client: any) => {
  const roles = [
    { nombre: "admin",          descripcion: "Administrador del sistema con acceso total" },
    { nombre: "profesor",       descripcion: "Docente con acceso a cursos y matrículas" },
    { nombre: "estudiante",     descripcion: "Estudiante matriculado en la institución" },
    { nombre: "administrativo", descripcion: "Personal administrativo de la institución" },
  ]

  for (const role of roles) {
    await query(
      `INSERT INTO roles (nombre, descripcion)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [role.nombre, role.descripcion],
      client
    )
  }

  console.log("  ✓ Roles creados")
}

// -----------------------------------------------------------------------------
// PERMISOS — recurso + acción por cada entidad del sistema
// -----------------------------------------------------------------------------
const seedPermisos = async (client: any) => {
  // Matriz de permisos: cada recurso tiene sus acciones
  const recursos = [
    "usuarios", "personas", "estudiantes", "profesores",
    "administrativos", "cursos", "matriculas", "documentos",
    "roles", "permisos", "acudientes", "jornadas", "expedientes",
  ]

  const acciones = ["create", "read", "update", "delete"]

  const permisos: { nombre: string; recurso: string; accion: string }[] = []

  for (const recurso of recursos) {
    for (const accion of acciones) {
      permisos.push({
        nombre:  `${recurso}:${accion}`,
        recurso,
        accion,
      })
    }
    // manage = acceso completo al recurso (atajo para admin)
    permisos.push({ nombre: `${recurso}:manage`, recurso, accion: "manage" })
  }

  for (const permiso of permisos) {
    await query(
      `INSERT INTO permisos (nombre, recurso, accion)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [permiso.nombre, permiso.recurso, permiso.accion],
      client
    )
  }

  console.log(`  ✓ ${permisos.length} permisos creados`)
}

// -----------------------------------------------------------------------------
// ASIGNAR PERMISOS A ROLES
// admin     → manage en todos los recursos
// profesor  → read en estudiantes, cursos, matrículas; read/update en expedientes
// administrativo → read en la mayoría; create/update en estudiantes y matrículas
// -----------------------------------------------------------------------------
const seedRolePermisos = async (client: any) => {
  // Obtener IDs de roles
  const rolesResult = await query(`SELECT role_id, nombre FROM roles`, [], client)
  const roles: Record<string, number> = {}
  rolesResult.rows.forEach((r: any) => { roles[r.nombre] = r.role_id })

  // Helper para obtener permiso_id por nombre
  const getPermiso = async (nombre: string): Promise<number | null> => {
    const res = await query(
      `SELECT permiso_id FROM permisos WHERE nombre = $1`,
      [nombre],
      client
    )
    return res.rows[0]?.permiso_id ?? null
  }

  const assignPermiso = async (roleNombre: string, permisoNombre: string) => {
    const roleId    = roles[roleNombre]
    const permisoId = await getPermiso(permisoNombre)
    if (!roleId || !permisoId) return

    await query(
      `INSERT INTO role_permisos (role_id, permiso_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [roleId, permisoId],
      client
    )
  }

  // Admin → manage en todo
  const recursos = [
    "usuarios", "personas", "estudiantes", "profesores",
    "administrativos", "cursos", "matriculas", "documentos",
    "roles", "permisos", "acudientes", "jornadas", "expedientes",
  ]
  for (const recurso of recursos) {
    await assignPermiso("admin", `${recurso}:manage`)
  }

  // Profesor → lectura de lo que necesita para trabajar
  const permisoProfesor = [
    "estudiantes:read", "cursos:read", "matriculas:read",
    "expedientes:read", "expedientes:update",
    "personas:read", "acudientes:read", "documentos:read",
  ]
  for (const p of permisoProfesor) await assignPermiso("profesor", p)

  // Administrativo → gestión operativa
  const permisoAdministrativo = [
    "estudiantes:read", "estudiantes:create", "estudiantes:update",
    "personas:read", "personas:create", "personas:update",
    "matriculas:read", "matriculas:create", "matriculas:update",
    "cursos:read", "jornadas:read",
    "acudientes:read", "acudientes:create",
    "documentos:read", "documentos:create",
    "expedientes:read", "expedientes:update",
  ]
  for (const p of permisoAdministrativo) await assignPermiso("administrativo", p)

  console.log("  ✓ Permisos asignados a roles")
}

// -----------------------------------------------------------------------------
// DECRETOS Y GRADOS DE ESCALAFÓN
// -----------------------------------------------------------------------------
const seedDecretosYGrados = async (client: any) => {
  const decretos = [
    { codigo: "2277", nombre: "Decreto 2277 de 1979", descripcion: "Estatuto docente antiguo" },
    { codigo: "1278", nombre: "Decreto 1278 de 2002", descripcion: "Estatuto de profesionalización docente" },
  ]

  for (const d of decretos) {
    await query(
      `INSERT INTO decretos (codigo, nombre, descripcion) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [d.codigo, d.nombre, d.descripcion],
      client
    )
  }

  const decreto2277Result = await query(`SELECT decreto_id FROM decretos WHERE codigo = '2277' LIMIT 1`, [], client)
  const decreto1278Result = await query(`SELECT decreto_id FROM decretos WHERE codigo = '1278' LIMIT 1`, [], client)
  const id2277 = decreto2277Result.rows[0]?.decreto_id
  const id1278 = decreto1278Result.rows[0]?.decreto_id

  if (id2277) {
    const grados2277 = [
      { codigo: "A",  descripcion: "Grado transitorio A",  orden: 1 },
      { codigo: "B",  descripcion: "Grado transitorio B",  orden: 2 },
      { codigo: "1",  descripcion: "Grado 1",              orden: 3 },
      { codigo: "2",  descripcion: "Grado 2",              orden: 4 },
      { codigo: "3",  descripcion: "Grado 3",              orden: 5 },
      { codigo: "4",  descripcion: "Grado 4",              orden: 6 },
      { codigo: "5",  descripcion: "Grado 5",              orden: 7 },
      { codigo: "6",  descripcion: "Grado 6",              orden: 8 },
      { codigo: "7",  descripcion: "Grado 7",              orden: 9 },
      { codigo: "8",  descripcion: "Grado 8",              orden: 10 },
      { codigo: "9",  descripcion: "Grado 9",              orden: 11 },
      { codigo: "10", descripcion: "Grado 10",             orden: 12 },
      { codigo: "11", descripcion: "Grado 11",             orden: 13 },
      { codigo: "12", descripcion: "Grado 12",             orden: 14 },
      { codigo: "13", descripcion: "Grado 13",             orden: 15 },
      { codigo: "14", descripcion: "Grado 14",             orden: 16 },
    ]
    for (const g of grados2277) {
      await query(
        `INSERT INTO grados_escalafon (decreto_id, codigo, descripcion, orden) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [id2277, g.codigo, g.descripcion, g.orden],
        client
      )
    }
  }

  if (id1278) {
    const grados1278 = [
      { codigo: "1A", descripcion: "Nivel 1 — Categoría A", orden: 1 },
      { codigo: "1B", descripcion: "Nivel 1 — Categoría B", orden: 2 },
      { codigo: "1C", descripcion: "Nivel 1 — Categoría C", orden: 3 },
      { codigo: "1D", descripcion: "Nivel 1 — Categoría D", orden: 4 },
      { codigo: "2A", descripcion: "Nivel 2 — Categoría A", orden: 5 },
      { codigo: "2B", descripcion: "Nivel 2 — Categoría B", orden: 6 },
      { codigo: "2C", descripcion: "Nivel 2 — Categoría C", orden: 7 },
      { codigo: "2D", descripcion: "Nivel 2 — Categoría D", orden: 8 },
      { codigo: "3A", descripcion: "Nivel 3 — Categoría A", orden: 9 },
      { codigo: "3B", descripcion: "Nivel 3 — Categoría B", orden: 10 },
      { codigo: "3C", descripcion: "Nivel 3 — Categoría C", orden: 11 },
      { codigo: "3D", descripcion: "Nivel 3 — Categoría D", orden: 12 },
    ]
    for (const g of grados1278) {
      await query(
        `INSERT INTO grados_escalafon (decreto_id, codigo, descripcion, orden) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [id1278, g.codigo, g.descripcion, g.orden],
        client
      )
    }
  }

  console.log("  ✓ Decretos y grados de escalafón creados")
}

// -----------------------------------------------------------------------------
// JORNADAS
// -----------------------------------------------------------------------------
const seedJornadas = async (client: any) => {
  const jornadas = [
    { nombre: "Mañana",  hora_inicio: "06:00", hora_fin: "12:00" },
    { nombre: "Tarde",   hora_inicio: "12:00", hora_fin: "18:00" },
    { nombre: "Noche",   hora_inicio: "18:00", hora_fin: "22:00" },
    { nombre: "Completa",hora_inicio: "06:00", hora_fin: "18:00" },
  ]

  for (const jornada of jornadas) {
     await query(
      `INSERT INTO jornadas (nombre, hora_inicio, hora_fin)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [jornada.nombre, jornada.hora_inicio, jornada.hora_fin],
      client
    )
  }


  console.log("  ✓ Jornadas creadas")

}

// -----------------------------------------------------------------------------
// TIPOS DE DOCUMENTO
// -----------------------------------------------------------------------------
const seedTiposDocumento = async (client: any) => {
  const tipos = [
    { tipo_documento: "CC",  nombre_documento: "Cédula de Ciudadanía" },
    { tipo_documento: "TI",  nombre_documento: "Tarjeta de Identidad" },
    { tipo_documento: "RC",  nombre_documento: "Registro Civil" },
    { tipo_documento: "CE",  nombre_documento: "Cédula de Extranjería" },
    { tipo_documento: "PA",  nombre_documento: "Pasaporte" },
    { tipo_documento: "NIT", nombre_documento: "Número de Identificación Tributaria" },
    { tipo_documento: "PEP", nombre_documento: "Permiso Especial de Permanencia" },
  ]

  for (const tipo of tipos) {
    await query(
      `INSERT INTO tipo_documento (tipo_documento, nombre_documento)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [tipo.tipo_documento, tipo.nombre_documento],
      client
    )
  }

  console.log("  ✓ Tipos de documento creados")
}

// -----------------------------------------------------------------------------
// TIPOS DE ARCHIVO
// Incluye aplica_a y requerido_en como TEXT[] —
// dbInit los convertirá a contexto_archivo[] en el arranque.
// -----------------------------------------------------------------------------
const seedTiposArchivo = async (client: any) => {
  const tipos = [
    // Documentos de identidad — aplica a todos
    {
      nombre:                  "Documento de Identidad",
      descripcion:             "Cédula, Tarjeta de Identidad o Registro Civil del estudiante",
      extensiones_permitidas:  [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
      aplica_a:                ["estudiante", "profesor", "administrativo", "acudiente"],
      requerido_en:            ["matricula"],
    },
    // Foto de perfil — aplica a todos
    {
      nombre:                  "Foto de Perfil",
      descripcion:             "Fotografía reciente tamaño carnet",
      extensiones_permitidas:  [".jpg", ".jpeg", ".png", ".webp"],
      aplica_a:                ["estudiante", "profesor", "administrativo", "acudiente"],
      requerido_en:            [],
    },
    // Boletín de notas — solo estudiante, requerido en matrícula
    {
      nombre:                  "Boletín de Notas",
      descripcion:             "Boletín de notas del año anterior o del colegio anterior",
      extensiones_permitidas:  [".pdf", ".jpg", ".jpeg", ".png"],
      aplica_a:                ["estudiante"],
      requerido_en:            ["matricula"],
    },
    // Certificado de salud — estudiante, requerido en matrícula
    {
      nombre:                  "Certificado de Salud",
      descripcion:             "Certificado médico que acredita buen estado de salud",
      extensiones_permitidas:  [".pdf"],
      aplica_a:                ["estudiante"],
      requerido_en:            ["matricula"],
    },
    // Certificado de vacunación — estudiante
    {
      nombre:                  "Certificado de Vacunación",
      descripcion:             "Carnet o certificado de vacunas al día",
      extensiones_permitidas:  [".pdf", ".jpg", ".jpeg", ".png"],
      aplica_a:                ["estudiante"],
      requerido_en:            [],
    },
    // Contrato de matrícula — matrícula
    {
      nombre:                  "Contrato de Matrícula",
      descripcion:             "Contrato firmado por el acudiente para formalizar la matrícula",
      extensiones_permitidas:  [".pdf"],
      aplica_a:                ["estudiante"],
      requerido_en:            ["matricula"],
    },
    // Hoja de vida — profesores y administrativos
    {
      nombre:                  "Hoja de Vida",
      descripcion:             "Curriculum vitae del docente o personal administrativo",
      extensiones_permitidas:  [".pdf", ".docx"],
      aplica_a:                ["profesor", "administrativo"],
      requerido_en:            [],
    },
    // Título profesional — profesores
    {
      nombre:                  "Título Profesional",
      descripcion:             "Diploma o acta de grado del docente",
      extensiones_permitidas:  [".pdf", ".jpg", ".jpeg", ".png"],
      aplica_a:                ["profesor"],
      requerido_en:            [],
    },
    // Paz y salvo — aplica a todos
    {
      nombre:                  "Paz y Salvo",
      descripcion:             "Documento que certifica que no tiene deudas pendientes con la institución",
      extensiones_permitidas:  [".pdf"],
      aplica_a:                ["estudiante", "profesor", "administrativo"],
      requerido_en:            [],
    },
  ]

  for (const tipo of tipos) {
    await query(
      `INSERT INTO tipos_archivo
         (nombre, descripcion, extensiones_permitidas, activo, aplica_a, requerido_en)
       VALUES ($1, $2, $3, true, $4, $5)
       ON CONFLICT DO NOTHING`,
      [
        tipo.nombre,
        tipo.descripcion,
        tipo.extensiones_permitidas,
        tipo.aplica_a,
        tipo.requerido_en,
      ],
      client
    )
  }

  console.log("  ✓ Tipos de archivo creados")
}

// -----------------------------------------------------------------------------
// CURSOS — tomando en cuenta la Ley 115 de 1994
// -----------------------------------------------------------------------------
const seedCursos = async (client: any) => {
  // Obtener jornada_id de "Mañana" dinámicamente
  const jornadaResult = await query(
    `SELECT jornada_id FROM jornadas WHERE nombre = 'Mañana' LIMIT 1`,
    [],
    client
  )
  const jornadaId = jornadaResult.rows[0]?.jornada_id
  if (!jornadaId) throw new Error("Jornada 'Mañana' no encontrada — ejecuta seedJornadas primero")

  const cursos = [
    { grado: "1°",  nivel: "Primaria",    grupo: "A" },
    { grado: "2°",  nivel: "Primaria",    grupo: "A" },
    { grado: "3°",  nivel: "Primaria",    grupo: "A" },
    { grado: "4°",  nivel: "Primaria",    grupo: "A" },
    { grado: "5°",  nivel: "Primaria",    grupo: "A" },
    { grado: "6°",  nivel: "Secundaria",  grupo: "A" },
    { grado: "7°",  nivel: "Secundaria",  grupo: "A" },
    { grado: "8°",  nivel: "Secundaria",  grupo: "A" },
    { grado: "9°",  nivel: "Secundaria",  grupo: "A" },
    { grado: "10°", nivel: "Media",       grupo: "A" },
    { grado: "11°", nivel: "Media",       grupo: "A" },
  ]

  for (const curso of cursos) {
    await query(
      `INSERT INTO cursos (grado, nivel, grupo, jornada_id, capacidad_maxima)
       VALUES ($1, $2, $3, $4, 40)
       ON CONFLICT DO NOTHING`,
      [curso.grado, curso.nivel, curso.grupo, jornadaId],
      client
    )
  }

  console.log("  ✓ Cursos creados")
}

// -----------------------------------------------------------------------------
// USUARIO ADMIN — cuenta de acceso inicial al sistema
// Contraseña: Admin123! (el usuario debe cambiarla al primer login)
// -----------------------------------------------------------------------------
const seedAdminUser = async (client: any) => {
  // Verificar si ya existe
  const existingAdmin = await query(
    `SELECT usuario_id FROM usuarios WHERE email = 'admin@sigap.edu.co'`,
    [],
    client
  )

  if (existingAdmin.rows.length > 0) {
    console.log("  ✓ Usuario admin ya existe — omitido")
    return
  }

  // Crear persona del admin
  const tipoDocResult = await query(
    `SELECT tipo_documento_id FROM tipo_documento WHERE tipo_documento = 'CC' LIMIT 1`,
    [],
    client
  )
  const tipoDocId = tipoDocResult.rows[0]?.tipo_documento_id ?? 1

  const personaResult = await query(
    `INSERT INTO personas
       (nombres, apellido_paterno, apellido_materno, tipo_documento_id, numero_documento, fecha_nacimiento, genero)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING persona_id`,
    ["Administrador", "Sistema", "SIGAP", tipoDocId, "0000000000", "1990-01-01", "Masculino"],
    client
  )
  const personaId = personaResult.rows[0].persona_id

  // Crear usuario
  const hashedPassword = await bcrypt.hash("Admin123!", 12)
  const usuarioResult = await query(
    `INSERT INTO usuarios (persona_id, username, email, contraseña, activo)
     VALUES ($1, $2, $3, $4, true)
     RETURNING usuario_id`,
    [personaId, "admin", "admin@sigap.edu.co", hashedPassword],
    client
  )
  const usuarioId = usuarioResult.rows[0].usuario_id

  // Obtener role admin
  const roleResult = await query(
    `SELECT role_id FROM roles WHERE nombre = 'admin' LIMIT 1`,
    [],
    client
  )
  const roleId = roleResult.rows[0]?.role_id

  if (roleId) {
    await query(
      `INSERT INTO usuarios_role (usuario_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [usuarioId, roleId],
      client
    )
  }

  // Crear docente del admin
  const docenteResult = await query(
    `INSERT INTO docente (persona_id, estado)
     VALUES ($1, 'activo')
     RETURNING docente_id`,
    [personaId],
    client
  )
  const docenteId = docenteResult.rows[0].docente_id

  // Crear registro de administrativo con cargo
  await query(
    `INSERT INTO administrativos (docente_id, cargo)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [docenteId, "Administrador del Sistema"],
    client
  )

  console.log("  ✓ Usuario admin creado")
  console.log("    Email:      admin@sigap.edu.co")
  console.log("    Contraseña: Admin123!  ← CAMBIAR INMEDIATAMENTE")
}

// -----------------------------------------------------------------------------
// ENTRY POINT
// -----------------------------------------------------------------------------
const runDefaultSeed = async () => {
  console.log("\n🌱 Ejecutando seed de datos por defecto...\n")

  try {
    await transaction(async (client) => {
      await seedRoles(client)
      await seedPermisos(client)
      await seedRolePermisos(client)
      await seedDecretosYGrados(client)
      await seedJornadas(client)
      await seedTiposDocumento(client)
      await seedTiposArchivo(client)
      await seedCursos(client)
      await seedAdminUser(client)
    })

    console.log("\n✅ Seed de datos por defecto completado\n")
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error ejecutando seed:", error)
    process.exit(1)
  }
}

runDefaultSeed()
