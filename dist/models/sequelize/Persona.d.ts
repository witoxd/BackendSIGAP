import { Model, type Optional } from "sequelize";
interface PersonaAttributes {
    persona_id: number;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    tipo_documento_id: number;
    numero_documento: string;
    fecha_nacimiento: Date;
    genero: "Masculino" | "Femenino" | "Otro";
}
export interface PersonaCreationAttributes extends Optional<PersonaAttributes, "persona_id" | "apellido_materno" | "apellido_paterno"> {
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
}
export {};
//# sourceMappingURL=Persona.d.ts.map