import type { Request, Response, NextFunction, RequestHandler } from "express"

// ----------------------------------------------------------
// asyncHandler — elimina el try/catch repetitivo en controllers
//
// Analogía: es como una red de seguridad debajo de un trapecista.
// El artista (tu función) no necesita pensar en caerse —
// si algo falla, la red (errorHandler global) lo atrapa.
//
// Sin wrapper:
//   async create(req, res, next) {
//     try { ... } catch(e) { next(e) }  ← repetido en cada método
//   }
//
// Con wrapper:
//   create: asyncHandler(async (req, res) => { ... })
//
// Cualquier error lanzado (AppError, Error, rechazo de Promise)
// es capturado y enviado al errorHandler automáticamente.
// ----------------------------------------------------------
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
