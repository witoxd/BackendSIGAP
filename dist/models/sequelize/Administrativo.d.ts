import { Model, type Optional } from "sequelize";
interface AdministrativoAttributes {
    administrativo_id: number;
    persona_id: number;
    cargo: string;
    fecha_contratacion: Date;
    sede_id?: number;
    estado: boolean;
}
export interface AdministrativoCreationAttributes extends Optional<AdministrativoAttributes, "administrativo_id" | "persona_id"> {
}
export declare class Administrativo extends Model<AdministrativoAttributes, AdministrativoCreationAttributes> implements AdministrativoAttributes {
    administrativo_id: number;
    persona_id: number;
    cargo: string;
    fecha_contratacion: Date;
    sede_id?: number;
    estado: boolean;
}
export declare const AdministrativoInit: typeof Administrativo;
export {};
//# sourceMappingURL=Administrativo.d.ts.map