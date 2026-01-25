import type { Request, Response, NextFunction } from "express";
import type { Accion, Recurso } from "../types";
export declare const checkPermission: (recurso: Recurso, accion: Accion) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const canCreateUser: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=acl.d.ts.map