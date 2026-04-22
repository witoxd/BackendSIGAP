// =============================================================================
// TEST — EstudianteRepository
// =============================================================================
//
// Este repositorio es más complejo que AuditoriaRepository:
//   - Los resultados tienen forma anidada {persona, estudiante} (json_build_object en SQL)
//   - create() y update() reciben un client opcional (para transacciones)
//   - SearchIndex() tiene lógica interna: detecta si el término es numérico
//     y cambia la estrategia de búsqueda (número → ILIKE, texto → tsvector)
//
// NUEVOS CONCEPTOS vs el ejemplo de Auditoría:
//   - Cómo testear métodos que reciben `client` (transacciones)
//   - Cómo verificar que la lógica condicional interna funciona (SearchIndex)
//   - Cómo testear inserts con RETURNING (create)
// =============================================================================

jest.mock("../config/database", () => ({
  query: jest.fn(),
}))

import { EstudianteRepository } from "../models/Repository/EstudianteRepository"
import { query } from "../config/database"

const mockQuery = query as jest.MockedFunction<typeof query>

// Datos de prueba reutilizables — definidos una vez, usados en varios tests
const estudianteFalso = {
  persona: {
    persona_id: 1,
    nombres: "Carlos",
    apellido_paterno: "Gómez",
    apellido_materno: "Ruiz",
    numero_documento: "1020304050",
    tipo_documento: { tipo_documento_id: 1, tipo_documento: "CC" },
    genero: "M",
    fecha_nacimiento: "2010-05-15",
    tipo_sangre: "O+",
  },
  estudiante: {
    estudiante_id: 1,
    fecha_ingreso: "2023-01-15",
    estado: "activo",
  },
}

beforeEach(() => {
  mockQuery.mockClear()
})

// =============================================================================
describe("EstudianteRepository", () => {

  // ---------------------------------------------------------------------------
  describe("findAll", () => {

    it("devuelve lista de estudiantes con estructura {persona, estudiante}", async () => {
      mockQuery.mockResolvedValue({ rows: [estudianteFalso], rowCount: 1 } as any)

      const resultado = await EstudianteRepository.findAll(20, 0)

      expect(resultado).toHaveLength(1)
      // Verificar estructura anidada — así llegan los datos desde el SQL
      expect(resultado[0]).toHaveProperty("persona")
      expect(resultado[0]).toHaveProperty("estudiante")
      expect(resultado[0].persona.nombres).toBe("Carlos")
      expect(resultado[0].estudiante.estado).toBe("activo")

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("LIMIT $1 OFFSET $2"),
        [20, 0]
      )
    })

    it("usa los valores por defecto (limit=50, offset=0) si no se pasan", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as any)

      await EstudianteRepository.findAll()

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [50, 0]  // valores por defecto definidos en el método
      )
    })

  })

  // ---------------------------------------------------------------------------
  describe("findById", () => {

    it("devuelve el estudiante cuando existe", async () => {
      mockQuery.mockResolvedValue({ rows: [estudianteFalso], rowCount: 1 } as any)

      const resultado = await EstudianteRepository.findById(1)

      expect(resultado).toEqual(estudianteFalso)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE e.estudiante_id = $1"),
        [1]
      )
    })

    it("devuelve undefined si el estudiante no existe", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as any)

      const resultado = await EstudianteRepository.findById(9999)

      expect(resultado).toBeUndefined()
    })

  })

  // ---------------------------------------------------------------------------
  describe("findByDocumento", () => {

    it("devuelve el estudiante que coincide con el documento", async () => {
      mockQuery.mockResolvedValue({ rows: [estudianteFalso], rowCount: 1 } as any)

      const resultado = await EstudianteRepository.findByDocumento("1020304050")

      expect(resultado).toEqual(estudianteFalso)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ILIKE"),
        ["1020304050"]
      )
    })

  })

  // ---------------------------------------------------------------------------
  describe("SearchIndex — lógica condicional interna", () => {
    // SearchIndex tiene dos caminos:
    //   - Si el término es solo números → busca por documento (ILIKE)
    //   - Si tiene letras → busca por nombre con tsvector
    // Podemos verificar que el parámetro `isDocumento` se pasa correctamente

    it("detecta término numérico y pasa isDocumento=true a la query", async () => {
      mockQuery.mockResolvedValue({ rows: [estudianteFalso], rowCount: 1 } as any)

      await EstudianteRepository.SearchIndex("1020304050", 10)

      // El segundo parámetro del array debe ser true cuando el índice es numérico
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ["1020304050", true, 10]
      )
    })

    it("detecta término de texto y pasa isDocumento=false a la query", async () => {
      mockQuery.mockResolvedValue({ rows: [estudianteFalso], rowCount: 1 } as any)

      await EstudianteRepository.SearchIndex("Carlos Gomez", 10)

      // El segundo parámetro debe ser false cuando el índice tiene letras
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ["Carlos Gomez", false, 10]
      )
    })

    it("retorna array vacío si el término está vacío tras normalizar", async () => {
      // SearchIndex retorna [] directamente sin llamar a query si el término queda vacío
      const resultado = await EstudianteRepository.SearchIndex("   ", 10)

      expect(resultado).toEqual([])
      // Nunca debería haber llamado a la base de datos
      expect(mockQuery).not.toHaveBeenCalled()
    })

  })

  // ---------------------------------------------------------------------------
  describe("create", () => {
    // NUEVO CONCEPTO: métodos que reciben `client` para transacciones
    // El client es el mismo objeto que `query` — cuando está presente,
    // el repositorio lo usa en lugar del pool general.
    // En tests, lo simulamos con un objeto que tiene un método query mock.

    it("inserta el estudiante y retorna el registro creado", async () => {
      const registroCreado = {
        estudiante_id: 5,
        persona_id: 10,
        fecha_ingreso: "2024-03-01",
        estado: "activo",
      }
      mockQuery.mockResolvedValue({ rows: [registroCreado], rowCount: 1 } as any)

      const data = {
        persona_id: 10,
        fecha_ingreso: new Date("2024-03-01"),
        estado: "activo" as const,
      }

      const resultado = await EstudianteRepository.create(data)

      expect(resultado).toEqual(registroCreado)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO estudiantes"),
        expect.arrayContaining([10]),
        undefined  // sin client = sin transacción
      )
    })

    it("pasa el client cuando se ejecuta dentro de una transacción", async () => {
      const clientFalso = { query: jest.fn() }
      mockQuery.mockResolvedValue({ rows: [{ estudiante_id: 5, persona_id: 10 }], rowCount: 1 } as any)

      const data = { persona_id: 10, estado: "activo" as const }

      await EstudianteRepository.create(data, clientFalso)

      // El tercer argumento de query() debe ser el client
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO estudiantes"),
        expect.any(Array),
        clientFalso  // ← el client se propaga correctamente
      )
    })

  })

  // ---------------------------------------------------------------------------
  describe("update", () => {

    it("construye el SET dinámicamente con los campos enviados", async () => {
      const registroActualizado = { estudiante_id: 1, estado: "egresado" }
      mockQuery.mockResolvedValue({ rows: [registroActualizado], rowCount: 1 } as any)

      const resultado = await EstudianteRepository.update(1, { estado: "graduado" })

      expect(resultado).toEqual(registroActualizado)
      // El SQL debe tener UPDATE ... SET estado = $1 ... WHERE estudiante_id = $2
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE estudiantes SET"),
        expect.arrayContaining(["egresado", 1]),
        undefined
      )
    })

    it("retorna null si no se envían campos para actualizar", async () => {
      // update() con objeto vacío no debe llamar a la BD
      const resultado = await EstudianteRepository.update(1, {})

      expect(resultado).toBeNull()
      expect(mockQuery).not.toHaveBeenCalled()
    })

  })

  // ---------------------------------------------------------------------------
  describe("delete", () => {

    it("elimina el registro y lo retorna", async () => {
      const eliminado = { estudiante_id: 1, persona_id: 5, estado: "activo" }
      mockQuery.mockResolvedValue({ rows: [eliminado], rowCount: 1 } as any)

      const resultado = await EstudianteRepository.delete(1)

      expect(resultado).toEqual(eliminado)
      expect(mockQuery).toHaveBeenCalledWith(
        "DELETE FROM estudiantes WHERE estudiante_id = $1 RETURNING *",
        [1]
      )
    })

    it("retorna undefined si el estudiante no existía", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as any)

      const resultado = await EstudianteRepository.delete(9999)

      expect(resultado).toBeUndefined()
    })

  })

  // ---------------------------------------------------------------------------
  describe("count", () => {

    it("retorna el total como número (no string)", async () => {
      mockQuery.mockResolvedValue({ rows: [{ count: "87" }], rowCount: 1 } as any)

      const total = await EstudianteRepository.count()

      expect(total).toBe(87)
      expect(typeof total).toBe("number")
    })

  })

})
