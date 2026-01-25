import type { Request, Response, NextFunction } from "express";
import { CreateJornadaDTO, UpdateJornadDTO } from "../types";
type CreateJornadaStaticRequest = Request<never, unknown, CreateJornadaDTO>;
export declare class JornadaController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: CreateJornadaStaticRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: Request<{
        id: string;
    }, unknown, UpdateJornadDTO>, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export {};
//# sourceMappingURL=jornada.controller.d.ts.map