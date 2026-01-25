import type { Request, Response, NextFunction } from "express";
export declare class UserController {
    getUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    transferAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map