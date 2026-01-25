import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "../types";
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (roles: string | string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const isSelfOrAdmin: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map