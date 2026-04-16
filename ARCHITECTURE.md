# Arquitectura de Base de Datos — SIGAP v3

## Estrategia: Sequelize como DDL + pg para DML

El proyecto usa dos herramientas de base de datos con responsabilidades separadas y no intercambiables. Esta separación es intencional.

---

## Regla fundamental

| Herramienta | Responsabilidad | Usarla para... |
|-------------|-----------------|----------------|
| **Sequelize** | DDL — definición de esquema | Modelos, sync, relaciones entre tablas |
| **pg (raw SQL)** | DML — acceso a datos | Toda consulta, inserción, actualización, transacción |

**Sequelize nunca debe ejecutar queries de datos en runtime.** No usar `Model.findAll()`, `Model.create()`, `Model.update()`, `Model.destroy()`, ni `sequelize.transaction()` para operaciones de negocio.

---

## Por qué esta combinación

### Sequelize cubre lo que pg no puede hacer bien

- **Sync del esquema**: `sequelize.sync()` crea y actualiza tablas automáticamente desde los modelos TypeScript. Escribir DDL a mano o mantener migraciones SQL es costoso.
- **Definición de relaciones**: las asociaciones (`hasMany`, `belongsTo`, etc.) documentan el modelo de datos de forma legible en código.
- **Tipos TypeScript**: los modelos Sequelize generan los tipos e interfaces que se usan en todo el proyecto (`PersonaAttributes`, `MatriculaCreationAttributes`, etc.).

### pg cubre lo que Sequelize no hace bien

- **Control total sobre SQL**: el SQL generado por Sequelize para queries complejas es impredecible y difícil de optimizar.
- **Queries avanzadas de PostgreSQL**: el proyecto usa `to_tsvector`, `plainto_tsquery`, `json_build_object`, `ARRAY_AGG`, `ON CONFLICT DO NOTHING`, `ARRAY_REMOVE`, vistas, etc. Sequelize no soporta esto de forma natural o nativa.
- **Transacciones explícitas**: el patrón de pasar el `client` a través del stack garantiza atomicidad real. Sequelize gestiona sus propias transacciones de forma separada al pool de pg, lo que haría imposible combinar operaciones en una sola transacción segura.
- **Performance**: sin capa de abstracción ORM, las queries van directo a PostgreSQL.

---

## Cómo funciona en la práctica

### Acceso a datos — siempre vía Repositorios

Todos los accesos a la base de datos pasan por la capa Repository en `src/models/Repository/`. Nunca se debe llamar a `query()` directamente desde un controlador.

```
Controller / Service
      ↓
  Repository          ← única puerta de entrada a la BD
      ↓
query() / transaction()
      ↓
  pg Pool → PostgreSQL
```

### Transacciones — patrón de cliente explícito

Cuando una operación involucra múltiples tablas, se usa `transaction()` y se pasa el `client` a cada repositorio:

```typescript

await transaction(async (client) => {
  const persona = await PersonaRepository.create(data, client)
  const estudiante = await EstudianteRepository.create({ persona_id: persona.id, ... }, client)
})

// Incorrecto — mezclar sequelize.transaction() con query()
await sequelize.transaction(async (t) => {
  await query("INSERT INTO personas...", [...])  // Esta query NO está en la transacción de Sequelize
})
```

### Validación de dominio — Sequelize `.validate()`

Los modelos Sequelize pueden usarse para validar datos antes de persistir, sin necesidad de ejecutar un INSERT:

```typescript
//  Correcto — validar sin guardar
const instance = Persona.build(data)
await instance.validate()  // lanza ValidationError si falla

//  Incorrecto — nunca usar Sequelize para guardar datos
await Persona.create(data)
```

---

## Estructura de archivos

```
src/
├── models/
│   ├── sequelize/          # Modelos Sequelize — solo DDL y tipos
│   │   ├── Persona.ts
│   │   ├── Matricula.ts
│   │   └── ...
│   ├── Repository/         # Repositorios — toda la lógica de acceso a datos con pg
│   │   ├── PersonaRepository.ts
│   │   ├── MatriculaRepository.ts
│   │   └── ...
│   └── shared/             # SQL reutilizable (fragmentos, builders)
│       └── personasql.ts
├── config/
│   └── database.ts         # Exporta: pool, sequelize, query(), transaction()
├── services/               # Lógica de negocio — usa Repositorios
└── controllers/            # HTTP — orquesta servicios y repositorios
```

---

## Qué NO hacer

```typescript
//  No llamar query() desde un controller
router.post('/create', async (req, res) => {
  const result = await query("INSERT INTO personas...", [...])
})

//  No usar Sequelize ORM para queries de datos
const personas = await Persona.findAll({ where: { activo: true } })

//  No mezclar transacciones de ambos sistemas
await sequelize.transaction(async () => {
  await PersonaRepository.create(data)  // usa pg, no está en la transacción de Sequelize
})

//  No hacer queries directas fuera del patrón repository
const result = await pool.query("SELECT * FROM personas")
```

---


