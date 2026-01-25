export declare class AuditoriaRepository {
    static findAll(limit?: number, offset?: number): Promise<any>;
    static findById(id: number): Promise<any>;
    static findByUsuarioId(usuarioId: number, limit?: number, offset?: number): Promise<any>;
    static findByAccion(accion: string, limit?: number, offset?: number): Promise<any>;
    static findByTabla(tabla: string, limit?: number, offset?: number): Promise<any>;
    static count(): Promise<number>;
    static countByUsuario(usuarioId: number): Promise<number>;
}
//# sourceMappingURL=AuditoriaRepository.d.ts.map