export declare class archivoService {
    static deleteFileArray(files: Express.Multer.File[]): Promise<void>;
    static deleteOne(filePath: string): Promise<void>;
}
export declare class archivoMatriculaService {
    asociarArchivoMatricula(matriculaId: number, archivoId: number): Promise<void>;
    asociarBulkArchivoMatricula(matriculaId: number, archivoIds: number[]): Promise<void>;
}
//# sourceMappingURL=archivosMatricula.services.d.ts.map