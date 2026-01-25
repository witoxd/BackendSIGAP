import { Model, type Optional } from "sequelize";
interface TipoDocumentoAttributes {
    tipo_documento_id: number;
    tipo_documento: string;
    nombre_documento: string;
}
export interface TipoDocumentoCreationAttributes extends Optional<TipoDocumentoAttributes, "tipo_documento_id"> {
}
export declare class TipoDocumento extends Model<TipoDocumentoAttributes, TipoDocumentoCreationAttributes> implements TipoDocumentoAttributes {
    tipo_documento_id: number;
    tipo_documento: string;
    nombre_documento: string;
}
export {};
//# sourceMappingURL=TipoDocumento.d.ts.map