import { Model, type Optional } from "sequelize";
interface ArchivosAttributes {
    Archivo_id: number;
    persona_id: number;
    nombre: string;
    descripcion?: string;
    tipo_archivo: "certificado" | "diploma" | "constancia" | "carta" | "photo" | "otro";
    url_archivo: string;
    fecha_carga: Date;
    asignado_por?: number;
    activo: boolean;
}
export interface ArchivosCreationAttributes extends Optional<ArchivosAttributes, "Archivo_id" | "descripcion" | "fecha_carga" | "asignado_por"> {
}
export declare class Archivos extends Model<ArchivosAttributes, ArchivosCreationAttributes> implements ArchivosAttributes {
    Archivo_id: number;
    persona_id: number;
    nombre: string;
    descripcion?: string;
    tipo_archivo: "certificado" | "diploma" | "constancia" | "carta" | "photo" | "otro";
    url_archivo: string;
    fecha_carga: Date;
    asignado_por?: number;
    activo: boolean;
}
export {};
//# sourceMappingURL=Archivo.d.ts.map