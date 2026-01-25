import type { Request, Response } from "express";
import { CreateEstudianteDTO, UpdateEstudianteDTO } from "../types";
type CreateEstudianteStaticRequest = Request<never, unknown, CreateEstudianteDTO>;
type UpdateEstudianteStaticRequest = Request<{
    id: string;
}, unknown, UpdateEstudianteDTO>;
export declare class EstudianteController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    getByDocumento(req: Request, res: Response): Promise<void>;
    create(req: CreateEstudianteStaticRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    update(req: UpdateEstudianteStaticRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    delete(req: Request, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=estudiante.controller.d.ts.map