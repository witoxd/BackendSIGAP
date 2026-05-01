/**
 * Normaliza un valor de columna array de PostgreSQL a string[].
 *
 * El driver `pg` puede devolver arrays de tipos nativos (TEXT[], INT[]) como
 * JS arrays, pero arrays de tipos ENUM personalizados los devuelve como la
 * cadena literal "{val1,val2}" o incluso como un objeto vacío {}.
 *
 * Esta función cubre los tres casos:
 *   - Ya es un array JS          → lo devuelve filtrado
 *   - Es la cadena "{...}"       → lo parsea
 *   - Es null/undefined/{}       → devuelve []
 */
export function parsePostgresArray(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === "string") {
    return value
      .replace(/^\{|\}$/g, "")
      .split(",")
      .map((s) => s.replace(/^"|"$/g, "").trim())
      .filter(Boolean)
  }
  return []
}
