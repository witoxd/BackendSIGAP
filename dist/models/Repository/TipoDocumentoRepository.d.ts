import { TipoDocumentoCreationAttributes } from "../sequelize/TipoDocumento";
export declare class TipoDocumentoRepository {
    static findAll(): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByName(tipo_documento: string): Promise<any>;
    static create(data: Omit<TipoDocumentoCreationAttributes, "tipo_documento_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<TipoDocumentoCreationAttributes>, client?: any): Promise<any>;
    static delete(id: number): Promise<any>;
}
//# sourceMappingURL=TipoDocumentoRepository.d.ts.map