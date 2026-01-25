import type { Request, Response } from "express";
import { CreateMatriculaDTO, UpdateMatriculaDTO } from "../types";
type CreateMatriculaStaticRequest = Request<never, unknown, CreateMatriculaDTO>;
export declare class MatriculaController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    getByEstudiante(req: Request, res: Response): Promise<void>;
    getByCurso(req: Request, res: Response): Promise<void>;
    create(req: CreateMatriculaStaticRequest, res: Response): Promise<void>;
    update(req: Request<{
        id: string;
    }, unknown, UpdateMatriculaDTO>, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=matricula.controller.d.ts.map