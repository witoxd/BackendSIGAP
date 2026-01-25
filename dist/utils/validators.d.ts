import { type ValidationChain } from "express-validator";
export declare const registerValidator: ValidationChain[];
export declare const loginValidator: ValidationChain[];
export declare const changePasswordValidator: ValidationChain[];
export declare const searchValidator: ValidationChain[];
export declare const idValidator: ValidationChain[];
export declare const getPagination: (page?: string, limit?: string) => {
    limit: number;
    offset: number;
    page: number;
};
//# sourceMappingURL=validators.d.ts.map