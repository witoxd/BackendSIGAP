import { type ValidationChain } from "express-validator";
/**
 * Validador HTTP para crear archivo
 */
export declare const createArchivoHttpValidator: ValidationChain[];
/**
 * Validador HTTP para actualizar archivo
 * Todos los campos son opcionales en actualizacion
 */
export declare const updateArchivoHttpValidator: ValidationChain[];
export declare const archivoIdValidator: ValidationChain[];
export declare const searchArchivoValidator: ValidationChain[];
export declare const createArchivoValidator: ValidationChain[];
export declare const updateArchivoValidator: ValidationChain[];
export declare const archivoValidators: {
    createArchivoHttpValidator: ValidationChain[];
    updateArchivoHttpValidator: ValidationChain[];
    archivoIdValidator: ValidationChain[];
    searchArchivoValidator: ValidationChain[];
};
//# sourceMappingURL=archivo.validators.d.ts.map