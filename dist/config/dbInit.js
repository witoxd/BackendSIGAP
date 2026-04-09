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
exports.initializeDatabase = void 0;
const database_1 = require("./database");
// =============================================================================
// DATABASE INIT — Todo lo que Sequelize no puede crear nativamente
//
// Sequelize sync() crea las tablas y columnas básicas.
// Este script crea encima de eso:
//   - ENUMs personalizados
//   - Índices parciales (WHERE activo = true)
//   - Vistas derivadas (estado calculado de matrículas)
//   - Triggers (auto-desactivar período vencido)
//
// Se ejecuta después de sequelize.sync() en testConnection().
// En desarrollo con force: true, se ejecuta después de cada recreación.
// =============================================================================
// -----------------------------------------------------------------------------
// ENUM: contexto_archivo
// Reemplaza el string[] libre de aplica_a por un tipo validado por PostgreSQL.
// -----------------------------------------------------------------------------
const createEnums = () => __awaiter(void 0, void 0, void 0, function* () {
    // Paso 1 — crear el ENUM si no existe.
    // Si ya existe (segunda ejecución o force: false), lo ignora.
    yield (0, database_1.query)(`
    DO $$ BEGIN
      CREATE TYPE contexto_archivo AS ENUM (
        'estudiante',
        'profesor',
        'administrativo',
        'acudiente',
        'matricula'
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
    // Paso 2 — convertir aplica_a de TEXT[] a contexto_archivo[].
    //
    // Sequelize sync() creó la columna como TEXT[] porque en el modelo
    // usamos ARRAY(DataTypes.STRING). Ahora la promovemos al ENUM nativo.
    // Si ya es contexto_archivo[] (re-ejecución), el bloque DO ignora el error.
    yield (0, database_1.query)(`
    DO $$ BEGIN
      ALTER TABLE tipos_archivo
        ALTER COLUMN aplica_a
        TYPE contexto_archivo[]
        USING aplica_a::text[]::contexto_archivo[];
    EXCEPTION
      WHEN others THEN NULL;
    END $$;
  `);
    // Paso 3 — igual para requerido_en.
    // Sequelize también la creó como TEXT[] — mismo tratamiento.
    yield (0, database_1.query)(`
    DO $$ BEGIN
      ALTER TABLE tipos_archivo
        ALTER COLUMN requerido_en
        TYPE contexto_archivo[]
        USING requerido_en::text[]::contexto_archivo[];
    EXCEPTION
      WHEN others THEN NULL;
    END $$;
  `);
    console.log("  ✓ ENUMs configurados y columnas convertidas");
});
// -----------------------------------------------------------------------------
// ÍNDICES PARCIALES
// Sequelize no soporta índices parciales nativamente (WHERE condition).
// Son críticos para garantizar constraints de negocio a nivel de BD.
// -----------------------------------------------------------------------------
const createPartialIndexes = () => __awaiter(void 0, void 0, void 0, function* () {
    // Solo un período de matrícula puede estar activo a la vez
    // Si intentas activar un segundo, PostgreSQL rechaza el INSERT/UPDATE
    yield (0, database_1.query)(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_un_periodo_activo
      ON periodos_matricula(activo)
      WHERE activo = true;
  `);
    console.log("  ✓ Índices parciales creados");
});
// -----------------------------------------------------------------------------
// CONSTRAINTS ADICIONALES
// Los que Sequelize no genera o genera incorrectamente
// -----------------------------------------------------------------------------
const createConstraints = () => __awaiter(void 0, void 0, void 0, function* () {
    // Un estudiante no puede tener dos matrículas en el mismo período
    // Esto reemplaza la validación a nivel de código — la BD lo garantiza
    yield (0, database_1.query)(`
    DO $$ BEGIN
      ALTER TABLE matriculas
        ADD CONSTRAINT uq_estudiante_periodo
        UNIQUE (estudiante_id, periodo_id);
    EXCEPTION
      WHEN duplicate_table THEN NULL;
      WHEN others THEN NULL;
    END $$;
  `);
    // Un archivo no puede asociarse dos veces a la misma matrícula
    yield (0, database_1.query)(`
    DO $$ BEGIN
      ALTER TABLE matricula_archivos
        ADD CONSTRAINT uq_matricula_archivo
        UNIQUE (matricula_id, archivo_id);
    EXCEPTION
      WHEN duplicate_table THEN NULL;
      WHEN others THEN NULL;
    END $$;
  `);
    // Las fechas de un período deben ser coherentes
    yield (0, database_1.query)(`
    DO $$ BEGIN
      ALTER TABLE periodos_matricula
        ADD CONSTRAINT chk_fechas_periodo
        CHECK (fecha_fin >= fecha_inicio);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN others THEN NULL;
    END $$;
  `);
    console.log("  ✓ Constraints adicionales creados");
});
// -----------------------------------------------------------------------------
// VISTA: v_matriculas
//
// El estado de una matrícula se DERIVA de las fechas — nunca se actualiza
// manualmente excepto cuando el estudiante se retira.
//
// Analogía: no necesitas actualizar "es_mayor_de_edad" cada cumpleaños.
// Lo calculas en el momento: fecha_nacimiento + 18 < hoy.
// Lo mismo aquí: estado_actual = f(fecha_fin, activo, retiro).
//
// Lógica de estado_actual:
//   'retirada'   → el estudiante se retiró (única acción manual real)
//   'finalizada' → el período terminó (fecha_fin < hoy)
//   'activa'     → el período está activo y dentro de fechas
//   'inactiva'   → ninguna de las anteriores (período cerrado, futuro, etc.)
// -----------------------------------------------------------------------------
const createViews = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.query)(`
    CREATE OR REPLACE VIEW v_matriculas AS
    SELECT
      m.matricula_id,
      m.estudiante_id,
      m.curso_id,
      m.jornada_id,
      m.periodo_id,
      m.fecha_matricula,
      m.fecha_retiro,
      m.motivo_retiro,
      m.url_firma_alumno,
      m.url_firma_acudiente,

      -- Estado derivado — nunca desincronizado con la realidad
      CASE
        WHEN m.estado = 'retirada'      THEN 'retirada'
        WHEN p.fecha_fin < CURRENT_DATE THEN 'finalizada'
        WHEN p.activo = true            THEN 'activa'
        ELSE                                 'inactiva'
      END AS estado_actual,

      -- Estado interno (solo 'vigente' o 'retirada' — lo demás es cálculo)
      m.estado AS estado_raw,

      -- Datos del período para contexto
      p.anio,
      p.fecha_inicio  AS periodo_fecha_inicio,
      p.fecha_fin     AS periodo_fecha_fin,
      p.activo        AS periodo_activo,
      p.descripcion   AS periodo_descripcion,

      -- Días restantes (negativo = ya venció)
      (p.fecha_fin - CURRENT_DATE) AS dias_restantes_periodo

    FROM matriculas m
    INNER JOIN periodos_matricula p ON m.periodo_id = p.periodo_id;
  `);
    console.log("  ✓ Vista v_matriculas creada");
});
// -----------------------------------------------------------------------------
// TRIGGER: auto-desactivar período vencido
//
// Se ejecuta BEFORE INSERT en matriculas.
// Si el período activo ya pasó su fecha_fin, lo desactiva automáticamente
// y lanza un error claro antes de insertar la matrícula.
//
// Esto es la segunda línea de defensa después de verificarVigencia().
// Si alguien llama directo a la BD o el cron no corrió, el trigger lo atrapa.
// -----------------------------------------------------------------------------
const createTriggers = () => __awaiter(void 0, void 0, void 0, function* () {
    // Función del trigger
    yield (0, database_1.query)(`
    CREATE OR REPLACE FUNCTION fn_verificar_periodo_activo()
    RETURNS TRIGGER AS $$
    DECLARE
      v_periodo periodos_matricula%ROWTYPE;
    BEGIN
      -- Obtener el período asociado a la matrícula que se intenta crear
      SELECT * INTO v_periodo
        FROM periodos_matricula
        WHERE periodo_id = NEW.periodo_id;

      -- El período debe existir y estar activo
      IF v_periodo.periodo_id IS NULL THEN
        RAISE EXCEPTION 'El período de matrícula no existe';
      END IF;

      IF v_periodo.activo = false THEN
        RAISE EXCEPTION 'El período de matrícula no está activo';
      END IF;

      -- El período no debe haber vencido
      -- Nota: si venció pero activo=true, lo desactivamos aquí y rechazamos
      IF v_periodo.fecha_fin < CURRENT_DATE THEN
        UPDATE periodos_matricula
          SET activo = false
          WHERE periodo_id = NEW.periodo_id;

        RAISE EXCEPTION
          'El período de matrícula venció el %. Fue desactivado automáticamente.',
          v_periodo.fecha_fin;
      END IF;

      -- El período no puede estar en el futuro todavía
      IF v_periodo.fecha_inicio > CURRENT_DATE THEN
        RAISE EXCEPTION
          'El período de matrícula no ha comenzado. Comienza el %.',
          v_periodo.fecha_inicio;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
    // Asociar el trigger a la tabla matriculas
    yield (0, database_1.query)(`
    DROP TRIGGER IF EXISTS trg_verificar_periodo_activo ON matriculas;

    CREATE TRIGGER trg_verificar_periodo_activo
      BEFORE INSERT ON matriculas
      FOR EACH ROW
      EXECUTE FUNCTION fn_verificar_periodo_activo();
  `);
    console.log("  ✓ Triggers creados");
});
// -----------------------------------------------------------------------------
// FUNCIÓN AUXILIAR: estado_matricula()
//
// Útil para queries directas en pg Pool que no usan la vista.
// Ejemplo: SELECT estado_matricula(m.estado, p.fecha_fin, p.activo) FROM ...
// -----------------------------------------------------------------------------
const createFunctions = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.query)(`
    CREATE OR REPLACE FUNCTION estado_matricula(
      p_estado    TEXT,
      p_fecha_fin DATE,
      p_activo    BOOLEAN
    )
    RETURNS TEXT AS $$
    BEGIN
      RETURN CASE
        WHEN p_estado = 'retirada'      THEN 'retirada'
        WHEN p_fecha_fin < CURRENT_DATE THEN 'finalizada'
        WHEN p_activo = true            THEN 'activa'
        ELSE                                 'inactiva'
      END;
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;
  `);
    console.log("  ✓ Funciones auxiliares creadas");
});
// -----------------------------------------------------------------------------
// ÍNDICES DE PERFORMANCE
// Para las queries más frecuentes del sistema
// -----------------------------------------------------------------------------
const createPerformanceIndexes = () => __awaiter(void 0, void 0, void 0, function* () {
    const indexes = [
        // Búsquedas de matrícula por período (muy frecuente)
        `CREATE INDEX IF NOT EXISTS idx_matriculas_periodo
       ON matriculas(periodo_id)`,
        // Búsquedas de matrícula por estudiante
        `CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante
       ON matriculas(estudiante_id)`,
        // Búsquedas de archivos por persona (carga del repositorio de documentos)
        `CREATE INDEX IF NOT EXISTS idx_archivos_persona
       ON archivos(persona_id)`,
        // Búsquedas de matricula_archivos por matrícula
        `CREATE INDEX IF NOT EXISTS idx_matricula_archivos_matricula
       ON matricula_archivos(matricula_id)`,
        // Full-text search en personas (ya lo usas en SearchIndex)
        `CREATE INDEX IF NOT EXISTS idx_personas_nombres_fts
       ON personas
       USING gin(to_tsvector('spanish',
         coalesce(nombres, '') || ' ' ||
         coalesce(apellido_paterno, '') || ' ' ||
         coalesce(apellido_materno, '')
       ))`,
    ];
    for (const sql of indexes) {
        yield (0, database_1.query)(sql);
    }
    console.log("  ✓ Índices de performance creados");
});
// -----------------------------------------------------------------------------
// ENTRY POINT — ejecutar todo en orden
//
// El orden importa:
//   1. ENUMs primero (otras tablas los referencian)
//   2. Constraints y partial indexes (dependen de que las tablas existan)
//   3. Vistas y funciones (dependen de las tablas y constraints)
//   4. Triggers (dependen de las funciones)
//   5. Índices de performance (al final, no son críticos para integridad)
// -----------------------------------------------------------------------------
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔧 Inicializando configuración avanzada de base de datos...");
    try {
        yield createEnums();
        yield createPartialIndexes();
        yield createConstraints();
        yield createFunctions();
        yield createViews();
        yield createTriggers();
        yield createPerformanceIndexes();
        console.log("Base de datos inicializada correctamente\n");
    }
    catch (error) {
        console.error("Error en inicialización de base de datos:", error);
        throw error;
    }
});
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=dbInit.js.map