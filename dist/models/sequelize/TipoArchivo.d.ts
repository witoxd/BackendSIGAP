import { Model, type Optional } from "sequelize";
export type ContextoArchivo = "estudiante" | "profesor" | "administrativo" | "acudiente" | "matricula";
interface TipoArchivoAttributes {
    tipo_archivo_id: number;
    nombre: string;
    descripcion?: string;
    extensiones_permitidas?: string[];
    activo: boolean;
    aplica_a?: string[];
    requerido_en?: string[];
}
export interface TipoArchivoCreationAttributes extends Optional<TipoArchivoAttributes, "tipo_archivo_id" | "descripcion" | "extensiones_permitidas" | "activo" | "aplica_a" | "requerido_en"> {
}
export declare class TipoArchivo extends Model<TipoArchivoAttributes, TipoArchivoCreationAttributes> implements TipoArchivoAttributes {
    tipo_archivo_id: number;
    nombre: string;
    descripcion?: string;
    extensiones_permitidas?: string[];
    activo: boolean;
    aplica_a?: string[];
    requerido_en?: string[];
}
export {};
//# sourceMappingURL=TipoArchivo.d.ts.map