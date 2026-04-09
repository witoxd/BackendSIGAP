import type { TipoArchivoCreationAttributes } from "../sequelize/TipoArchivo";
import type { ContextoArchivo } from "../sequelize/TipoArchivo";
export declare class TipoArchivoRepository {
    /**
     * Obtener todos los tipos de archivo
     */
    static findAll(): Promise<any>;
    static countByTipo(id: number): Promise<any>;
    /**
     * Buscar tipo de archivo por ID
     */
    static findById(id: number): Promise<any>;
    /**
     * Buscar tipo de archivo por nombre
     */
    static findByNombre(nombre: string): Promise<any>;
    static create(data: Omit<TipoArchivoCreationAttributes, "tipo_archivo_id">, client?: any): Promise<any>;
    static update(id: number, data: Partial<TipoArchivoCreationAttributes>, client?: any): Promise<any>;
    static findByRol(rol: ContextoArchivo): Promise<any>;
    static findByContexto(contexto: ContextoArchivo): Promise<TipoArchivoCreationAttributes[]>;
    static findRequeridosPor(contexto: ContextoArchivo): Promise<any>;
    /**
     * Eliminar permanentemente un tipo de archivo
     */
    static hardDelete(id: number, client?: any): Promise<any>;
    /**
     * SoftDelete un tipo de archivo
     */
    static softDelete(id: number, client?: any): Promise<any>;
    /**
     * Contar tipos de archivo
     */
    static count(): Promise<number>;
    /**
     * Verificar si una extensión es permitida para un tipo de archivo
     */
    static isExtensionAllowed(tipoArchivoId: number, extension: string): Promise<boolean>;
}
//# sourceMappingURL=TipoArchivoRepository.d.ts.map