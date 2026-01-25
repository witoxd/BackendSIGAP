import type { Request, Response, NextFunction } from "express";
export declare class AuditoriaController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByUsuarioId(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByAccion(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByTabla(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=auditoria.controller.d.ts.map