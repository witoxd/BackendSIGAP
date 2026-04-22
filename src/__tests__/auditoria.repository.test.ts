// =============================================================================
// EJEMPLO DE TEST — AuditoriaRepository
// =============================================================================
//
// CONCEPTO CLAVE: Mock vs Real
// ----------------------------
// Este test NO habla con la base de datos real.
// En su lugar "mockeamos" (simulamos) la función query() para que devuelva
// datos inventados. Así el test es:
//   - Rápido (sin red, sin BD)
//   - Predecible (los datos no cambian)
//   - Aislado (un fallo en la BD no rompe los tests)
//
// Analogía: es como ensayar una obra de teatro con actores que dicen
// las líneas correctas en el momento correcto, sin necesitar el escenario real.
//
// ESTRUCTURA DE CADA TEST:
//   1. Arrange — preparar los datos y mocks
//   2. Act     — ejecutar el código que queremos probar
//   3. Assert  — verificar que el resultado es el esperado
// =============================================================================

// jest.mock intercepta el import de database y reemplaza query() con una función
// falsa que nosotros controlamos. El código de AuditoriaRepository importa query
// normalmente, pero en tests recibe el mock sin saberlo.
jest.mock("../config/database", () => ({
  query: jest.fn(),
}))

import { AuditoriaRepository } from "../models/Repository/AuditoriaRepository"
import { query } from "../config/database"

// Cast necesario para que TypeScript sepa que es un mock de Jest
// y nos deje usar .mockResolvedValue(), .mockRejectedValue(), etc.
const mockQuery = query as jest.MockedFunction<typeof query>

// =============================================================================
// describe() agrupa tests relacionados — aparecen juntos en la salida
// =============================================================================
describe("AuditoriaRepository", () => {

  // beforeEach se ejecuta antes de CADA test individual
  // Limpia el mock para que los tests no se contaminen entre sí
  beforeEach(() => {
    mockQuery.mockClear()
  })

  // ---------------------------------------------------------------------------
  // findAll
  // ---------------------------------------------------------------------------
  describe("findAll", () => {

    // it() o test() define un caso individual
    // El nombre debe describir QUÉ debería pasar, no cómo
    it("devuelve los registros de auditoría con paginación", async () => {
      // ARRANGE: definimos qué va a "responder" la BD falsa
      const filasFalsas = [
        {
          auditoria_id: 1,
          accion: "CREATE",
          tabla: "personas",
          fecha_accion: new Date("2025-01-01"),
          usuario_id: 10,
          username: "jperez",
          nombres: "Juan",
          apellido_paterno: "Pérez",
        },
        {
          auditoria_id: 2,
          accion: "UPDATE",
          tabla: "matriculas",
          fecha_accion: new Date("2025-01-02"),
          usuario_id: 11,
          username: "mlopez",
          nombres: "María",
          apellido_paterno: "López",
        },
      ]

      // mockResolvedValue simula que query() resolvió exitosamente con estos datos
      mockQuery.mockResolvedValue({ rows: filasFalsas, rowCount: 2 } as any)

      // ACT: ejecutar el método real
      const resultado = await AuditoriaRepository.findAll(10, 0)

      // ASSERT: verificar resultados

      // ¿Devolvió los datos correctos?
      expect(resultado).toEqual(filasFalsas)
      expect(resultado).toHaveLength(2)

      // ¿Llamó a query() exactamente una vez?
      expect(mockQuery).toHaveBeenCalledTimes(1)

      // ¿Pasó los parámetros correctos (limit y offset)?
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("LIMIT $1 OFFSET $2"), // el SQL contiene paginación
        [10, 0]                                         // con los valores correctos
      )
    })

    it("devuelve array vacío si no hay registros", async () => {
      // ARRANGE: BD vacía
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as any)

      // ACT
      const resultado = await AuditoriaRepository.findAll()

      // ASSERT
      expect(resultado).toEqual([])
      expect(resultado).toHaveLength(0)
    })

    it("propaga el error si query() falla", async () => {
      // ARRANGE: simular un error de BD
      mockQuery.mockRejectedValue(new Error("Connection refused"))

      // ASSERT: el método debe lanzar el error (no tragárselo)
      // expect(...).rejects.toThrow() espera que la Promise falle
      await expect(AuditoriaRepository.findAll()).rejects.toThrow("Connection refused")
    })

  })

  // ---------------------------------------------------------------------------
  // findById
  // ---------------------------------------------------------------------------
  describe("findById", () => {

    it("devuelve el registro cuando existe", async () => {
      const filaFalsa = {
        auditoria_id: 5,
        accion: "DELETE",
        tabla: "archivos",
        usuario_id: 10,
        username: "jperez",
        nombres: "Juan",
        apellido_paterno: "Pérez",
      }

      mockQuery.mockResolvedValue({ rows: [filaFalsa], rowCount: 1 } as any)

      const resultado = await AuditoriaRepository.findById(5)

      expect(resultado).toEqual(filaFalsa)
      // El SQL debe incluir el WHERE con el ID
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE a.auditoria_id = $1"),
        [5]
      )
    })

    it("devuelve undefined cuando no existe el ID", async () => {
      // rows vacío → rows[0] es undefined
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 } as any)

      const resultado = await AuditoriaRepository.findById(9999)

      expect(resultado).toBeUndefined()
    })

  })

  // ---------------------------------------------------------------------------
  // count
  // ---------------------------------------------------------------------------
  describe("count", () => {

    it("retorna el total como número", async () => {
      // PostgreSQL devuelve count como string — el repositorio lo convierte a number
      mockQuery.mockResolvedValue({ rows: [{ count: "42" }], rowCount: 1 } as any)

      const total = await AuditoriaRepository.count()

      // Verificar que devuelve number, no string
      expect(total).toBe(42)
      expect(typeof total).toBe("number")
    })

  })

})
