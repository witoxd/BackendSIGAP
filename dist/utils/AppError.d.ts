export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: any[];
    constructor(message: string, statusCode: number, errors?: any[]);
}
export declare class ValidationError extends AppError {
    constructor(message: string, errors?: any[]);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=AppError.d.ts.map