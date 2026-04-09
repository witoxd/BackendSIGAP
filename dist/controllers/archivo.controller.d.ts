import type { Request, Response, NextFunction } from "express";
export declare class ArchivoController {
    getAll: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    getById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    getByPersonaId: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    getByTipo: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    getByTipoAndPersona: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    getPhotoByPersonaId: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    /**
     * Crear un nuevo archivo con subida física
     */
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Crear múltiples archivos con metadata individual
     * FORMATO:
     * - archivos: array de files
     * - persona_id: número
     * - metadata: JSON string array con: [{"tipo_archivo_id":1,"descripcion":"..."}, ...]
     */
    bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Actualizar un archivo (opcionalmente con nuevo archivo físico)
     */
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Eliminar archivo (registro y archivo físico)
     */
    delete: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    /**
     * Descargar archivo
     */
    download: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    /**
     * Ver archivo en navegador
     */
    view: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
}
//# sourceMappingURL=archivo.controller.d.ts.map