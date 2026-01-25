import type { Request, Response } from "express";
import { CreateProfesorDTO, UpdateProfesorDTO } from "../types";
type CreateProfesorStaticRequest = Request<never, unknown, CreateProfesorDTO>;
export declare class ProfesorController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: CreateProfesorStaticRequest, res: Response): Promise<void>;
    update(req: Request<{
        id: string;
    }, unknown, UpdateProfesorDTO>, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=profesor.controller.d.ts.map