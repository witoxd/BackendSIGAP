import type { Request, Response, NextFunction } from "express";
import { CreateSedeDTO, UpdateSedeDTO } from "../types";
type CreateSedeStaticDTO = Request<never, unknown, CreateSedeDTO>;
export declare class SedeController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: CreateSedeStaticDTO, res: Response, next: NextFunction): Promise<void>;
    update(req: Request<{
        id: string;
    }, unknown, UpdateSedeDTO>, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export {};
//# sourceMappingURL=sede.controller.d.ts.map