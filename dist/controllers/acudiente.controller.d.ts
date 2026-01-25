import type { Request, Response, NextFunction } from "express";
import { CreateAcudianteDTO, UpdateAcudianteDTO } from "../types";
import { assignToEstudiante } from "../types";
type CreateAcudienteAsingEstudiante = Request<never, unknown, assignToEstudiante>;
type CreateAcudienteStaticRequest = Request<never, unknown, CreateAcudianteDTO>;
export declare class AcudienteController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByEstudiante(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: CreateAcudienteStaticRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: Request<{
        id: string;
    }, unknown, UpdateAcudianteDTO>, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignToEstudiante(req: CreateAcudienteAsingEstudiante, res: Response, next: NextFunction): Promise<void>;
    removeFromEstudiante(req: Request<{
        estudianteId: string;
        acudienteId: string;
    }>, res: Response, next: NextFunction): Promise<void>;
}
export {};
//# sourceMappingURL=acudiente.controller.d.ts.map