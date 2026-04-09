import { Model, type Optional } from "sequelize";
export interface PersonaAttributes {
    persona_id: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    tipo_documento_id: number;
    numero_documento: string;
    fecha_nacimiento: Date;
    genero: "Masculino" | "Femenino" | "Otro";
    grupo_sanguineo?: string;
    grupo_etnico?: string;
    credo_religioso?: string;
    lugar_nacimiento?: string;
    serial_registro_civil?: string;
    expedida_en?: string;
}
export interface PersonaCreationAttributes extends Optional<PersonaAttributes, "persona_id" | "apellido_materno" | "apellido_paterno" | "grupo_sanguineo" | "grupo_etnico" | "credo_religioso" | "lugar_nacimiento" | "serial_registro_civil" | "expedida_en"> {
}
export declare class Persona extends Model<PersonaAttributes, PersonaCreationAttributes> implements PersonaAttributes {
    persona_id: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    tipo_documento_id: number;
    numero_documento: string;
    fecha_nacimiento: Date;
    genero: "Masculino" | "Femenino" | "Otro";
    grupo_sanguineo?: string;
    grupo_etnico?: string;
    credo_religioso?: string;
    lugar_nacimiento?: string;
    serial_registro_civil?: string;
    expedida_en?: string;
}
//# sourceMappingURL=Persona.d.ts.map