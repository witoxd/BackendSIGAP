import type { Request, Response, NextFunction } from "express";
import { CreateEgresadoDTO, UpdateEgresadoDTO } from "../types";
type CreateEgresadoStaticRequest = Request<never, unknown, CreateEgresadoDTO>;
type UpdateEgresadosStaticRequest = Request<{
    id: string;
}, unknown, UpdateEgresadoDTO>;
export declare class EgresadoController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByEstudianteId(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByYear(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: CreateEgresadoStaticRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: UpdateEgresadosStaticRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export {};
//# sourceMappingURL=egresado.controller.d.ts.map