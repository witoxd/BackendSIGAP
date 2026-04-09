import type { Request, Response, NextFunction } from "express";
export declare const validateCreateUserDomain: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const validateCreateUserWithPersonaDomain: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const validateResetPasswordDomain: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.domain.d.ts.map