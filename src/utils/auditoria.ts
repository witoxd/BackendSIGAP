import { query } from "../config/database"
import type { PoolClient } from "pg"

type AccionAuditoria = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT"

interface RegistroAuditoriaParams {
  tabla_nombre: string
  accion: AccionAuditoria
  usuario_id?: number | null
  detalle?: Record<string, unknown> | null
}

export async function registrarAuditoria(
  params: RegistroAuditoriaParams,
  client?: PoolClient,
): Promise<void> {
  const sql = `INSERT INTO auditoria (tabla_nombre, accion, usuario_id, detalle) VALUES ($1, $2, $3, $4)`
  const values = [
    params.tabla_nombre,
    params.accion,
    params.usuario_id ?? null,
    params.detalle ? JSON.stringify(params.detalle) : null,
  ]
  if (client) {
    await client.query(sql, values)
  } else {
    await query(sql, values)
  }
}
