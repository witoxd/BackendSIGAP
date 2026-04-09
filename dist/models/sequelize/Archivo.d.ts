import { Model, type Optional } from "sequelize";
interface ArchivosAttributes {
    archivo_id: number;
    persona_id: number;
    tipo_archivo_id: number;
    nombre: string;
    descripcion?: string;
    url_archivo: string;
    fecha_carga: Date;
    asignado_por?: number;
    activo: boolean;
}
export interface ArchivosCreationAttributes extends Optional<ArchivosAttributes, "archivo_id" | "descripcion" | "fecha_carga" | "asignado_por" | "activo"> {
}
export declare class Archivos extends Model<ArchivosAttributes, ArchivosCreationAttributes> implements ArchivosAttributes {
    archivo_id: number;
    persona_id: number;
    tipo_archivo_id: number;
    nombre: string;
    descripcion?: string;
    url_archivo: string;
    fecha_carga: Date;
    asignado_por?: number;
    activo: boolean;
}
export {};
//# sourceMappingURL=Archivo.d.ts.map