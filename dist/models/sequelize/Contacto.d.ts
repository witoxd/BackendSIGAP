import { Model, type Optional } from "sequelize";
interface ContactoAttributes {
    contacto_id: number;
    persona_id: number;
    tipo_contacto: "telefono" | "celular" | "email" | "direccion" | "otro";
    valor: string;
    es_principal: boolean;
    activo: boolean;
}
export interface ContactoCreationAttributes extends Optional<ContactoAttributes, "contacto_id" | "es_principal" | "activo"> {
}
export declare class Contacto extends Model<ContactoAttributes, ContactoCreationAttributes> implements ContactoAttributes {
    contacto_id: number;
    persona_id: number;
    tipo_contacto: "telefono" | "celular" | "email" | "direccion" | "otro";
    valor: string;
    es_principal: boolean;
    activo: boolean;
}
export {};
//# sourceMappingURL=Contacto.d.ts.map