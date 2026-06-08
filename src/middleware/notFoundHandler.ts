import type { Request, Response, NextFunction } from "express"

// Trunca el path a 120 caracteres para evitar logs gigantes con URLs basura
function sanitizePath(url: string): string {
  try {
    const path = new URL(url, "http://x").pathname
    return path.length > 120 ? path.slice(0, 120) + "…" : path
  } catch {
    return "/?"
  }
}

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  const path = sanitizePath(req.originalUrl)

  // Log estructurado — útil para detectar scanners automatizados que
  // lanzan cientos de 404s buscando endpoints vulnerables
  console.warn(JSON.stringify({
    level:     "warn",
    event:     "not_found",
    method:    req.method,
    path,
    ip:        req.ip,
    userAgent: req.headers["user-agent"]?.slice(0, 100) ?? "unknown",
    timestamp: new Date().toISOString(),
  }))

  res.status(404).json({
    success: false,
    message: "El recurso solicitado no existe. Verifica el endpoint y el método HTTP.",
    code:    "NOT_FOUND",
  })
}
