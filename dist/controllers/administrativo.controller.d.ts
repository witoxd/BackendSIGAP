import type { NextFunction, Request, Response } from "express";
import { CreateAdministrativoDTO, UpdateAdministrativoDTO } from "../types";
type CreateAdministrativoStaticRequest = Request<never, unknown, CreateAdministrativoDTO>;
type UpdateAdministrativoStaticRequest = Request<{
    id: string;
}, unknown, UpdateAdministrativoDTO>;
export declare class AdministrativoController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: CreateAdministrativoStaticRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: UpdateAdministrativoStaticRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=administrativo.controller.d.ts.map