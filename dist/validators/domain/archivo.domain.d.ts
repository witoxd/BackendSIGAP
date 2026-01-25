import type { Request, Response, NextFunction } from "express";
/**
 * Validador de dominio para creacion de archivo
 * Nota: url_archivo se genera automaticamente desde el archivo subido,
 * por eso se usa un valor temporal para la validacion de Sequelize
 */
export declare const validateCreateArchivoDomain: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Validador de dominio para actualizacion de archivo
 */
export declare const validateUpdateArchivoDomain: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=archivo.domain.d.ts.map