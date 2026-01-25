import type { Request, Response } from "express";
import { CreateCursoDTO, updateCursoDTO } from "../types";
type CreateCursoStaticrequest = Request<never, unknown, CreateCursoDTO>;
export declare class CursoController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    getByProfesor(req: Request, res: Response): Promise<void>;
    create(req: CreateCursoStaticrequest, res: Response): Promise<void>;
    update(req: Request<{
        id: string;
    }, unknown, updateCursoDTO>, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=curso.controller.d.ts.map