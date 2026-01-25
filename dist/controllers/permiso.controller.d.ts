import type { Request, Response, NextFunction } from "express";
export declare class PermisoController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignToRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeFromRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkPermission(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=permiso.controller.d.ts.map