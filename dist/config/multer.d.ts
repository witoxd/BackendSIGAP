import multer from "multer";
/**
 * Obtiene la lista de extensiones permitidas para mostrar en mensajes de error
 */
export declare const getAllowedExtensions: () => string[];
/**
 * Obtiene el tamano maximo en formato legible
 */
export declare const getMaxFileSizeFormatted: () => string;
/**
 * Verifica si un MIME type esta permitido
 */
export declare const isAllowedMimeType: (mimeType: string) => boolean;
export declare const upload: multer.Multer;
export declare const handleMulterError: (err: any, req: any, res: any, next: any) => any;
export declare const uploadConfig: {
    baseDir: string;
    subdirs: {
        documento: string;
        certificado: string;
        diploma: string;
        constancia: string;
        carta: string;
        otro: string;
        photo: string;
    };
    allowedMimeTypes: {
        [key: string]: string[];
    };
    maxFileSize: number;
    maxFileSizeFormatted: string;
    allowedExtensions: string[];
};
/**
 * Elimina un archivo del sistema de archivos
 */
export declare const deleteFile: (filePath: string) => Promise<void>;
/**
 * Obtiene la URL relativa del archivo para almacenar en la BD
 */
export declare const getFileUrl: (file: Express.Multer.File) => string;
/**
 * Verifica si un archivo existe
 */
export declare const fileExists: (filePath: string) => boolean;
//# sourceMappingURL=multer.d.ts.map