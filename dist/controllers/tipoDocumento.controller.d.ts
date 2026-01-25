import type { Request, Response, NextFunction } from "express";
import { CreateTipoDocumentoDTO, UpdateTipoDocumentoDTO } from "../types";
type CreateTipoDocumentoStaticRequest = Request<never, unknown, CreateTipoDocumentoDTO>;
export declare class TipoDocumentoController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: CreateTipoDocumentoStaticRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: Request<{
        id: string;
    }, unknown, UpdateTipoDocumentoDTO>, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export {};
//# sourceMappingURL=tipoDocumento.controller.d.ts.map