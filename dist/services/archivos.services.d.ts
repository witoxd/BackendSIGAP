type ArchivoMetadataInput = {
    tipo_archivo_id: number | string;
    descripcion?: string | null;
};
export declare class archivoService {
    static deleteFileArray(files: Express.Multer.File[]): Promise<void>;
    static normalizeMetadata(metadata: unknown): ArchivoMetadataInput[];
    static RegisterFileArray(files: Express.Multer.File[], metadata: ArchivoMetadataInput[], personaId: number, userId: number, client?: any): Promise<any>;
}
export {};
//# sourceMappingURL=archivos.services.d.ts.map