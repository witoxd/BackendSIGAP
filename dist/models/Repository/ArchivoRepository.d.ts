import type { ArchivosCreationAttributes } from "../sequelize/Archivo";
export declare class ArchivoRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByPersonaId(personaId: number): Promise<any>;
    static findByTipo(tipoarchivos: number, limit?: number, offset?: number): Promise<any>;
    static findByTipoAndPerson(tipoarchivos: number, persona_id: number, limit?: number, offset?: number): Promise<any>;
    static findPhotoByPersonaId(personaId: number): Promise<any>;
    static create(data: Omit<ArchivosCreationAttributes, "archivo_id" | "fecha_carga" | "activo">, client?: any): Promise<any>;
    static bulkCreate(data: Omit<ArchivosCreationAttributes, "archivo_id" | "fecha_carga" | "activo">[], client?: any): Promise<any>;
    static update(id: number, data: Partial<ArchivosCreationAttributes>, client?: any): Promise<any>;
    static softDelete(id: number): Promise<void>;
    static delete(id: number): Promise<any>;
    static count(): Promise<number>;
    static countByPersona(personaId: number): Promise<number>;
}
//# sourceMappingURL=ArchivoRepository.d.ts.map