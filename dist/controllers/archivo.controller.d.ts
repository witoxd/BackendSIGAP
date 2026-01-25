import type { Request, Response, NextFunction } from "express";
import type { UpdateArchivoDTO } from "../types";
export declare class ArchivoController {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByPersonaId(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByTipo(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Crear un nuevo registro de archivo con subida de archivo fisico
     * El archivo se sube usando multer y se guarda en el sistema de archivos
     */
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Actualizar un registro de archivo
     * Opcionalmente puede incluir un nuevo archivo
     */
    update(req: Request<{
        id: string;
    }, unknown, UpdateArchivoDTO>, res: Response, next: NextFunction): Promise<void>;
    /**
     * Eliminar un archivo (registro y archivo fisico)
     */
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Descargar un archivo
     */
    download(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Ver archivo en el navegador (solo para PDFs e imagenes)
     */
    view(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=archivo.controller.d.ts.map