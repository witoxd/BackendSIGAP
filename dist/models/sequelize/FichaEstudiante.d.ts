import { Model, type Optional } from "sequelize";
interface FichaEstudianteAttributes {
    ficha_id: number;
    estudiante_id: number;
    motivo_traslado?: string;
    limitaciones_fisicas?: string;
    otras_limitaciones?: string;
    talentos_especiales?: string;
    otras_actividades?: string;
    numero_hermanos?: number;
    posicion_hermanos?: number;
    nombre_hermano_mayor?: string;
    parientes_hogar?: string;
    total_parientes?: number;
    eps_ars?: string;
    alergia?: string;
    centro_atencion_medica?: string;
    medio_transporte?: string;
    transporte_propio?: boolean;
    observaciones?: string;
    created_at?: Date;
    updated_at?: Date;
}
export interface FichaEstudianteCreationAttributes extends Optional<FichaEstudianteAttributes, "ficha_id" | "motivo_traslado" | "limitaciones_fisicas" | "otras_limitaciones" | "talentos_especiales" | "otras_actividades" | "numero_hermanos" | "posicion_hermanos" | "nombre_hermano_mayor" | "parientes_hogar" | "total_parientes" | "eps_ars" | "alergia" | "centro_atencion_medica" | "medio_transporte" | "transporte_propio" | "observaciones" | "created_at" | "updated_at"> {
}
export declare class FichaEstudiante extends Model<FichaEstudianteAttributes, FichaEstudianteCreationAttributes> implements FichaEstudianteAttributes {
    ficha_id: number;
    estudiante_id: number;
    motivo_traslado?: string;
    limitaciones_fisicas?: string;
    otras_limitaciones?: string;
    talentos_especiales?: string;
    otras_actividades?: string;
    numero_hermanos?: number;
    posicion_hermanos?: number;
    nombre_hermano_mayor?: string;
    parientes_hogar?: string;
    total_parientes?: number;
    eps_ars?: string;
    alergia?: string;
    centro_atencion_medica?: string;
    medio_transporte?: string;
    transporte_propio?: boolean;
    observaciones?: string;
    created_at?: Date;
    updated_at?: Date;
}
export {};
//# sourceMappingURL=FichaEstudiante.d.ts.map