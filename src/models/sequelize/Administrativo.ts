import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface AdministrativoAttributes {
  administrativo_id: number
  persona_id: number
  cargo: string
  fecha_contratacion: Date 
  sede_id?: number
  estado: boolean
}

export interface AdministrativoCreationAttributes extends Optional<AdministrativoAttributes, "administrativo_id" | "persona_id"> {}

 export class Administrativo
  extends Model<AdministrativoAttributes, AdministrativoCreationAttributes>
  implements AdministrativoAttributes
{
  public administrativo_id!: number
  public persona_id!: number
  public cargo!: string
  public fecha_contratacion!: Date
  public sede_id?: number
  public estado!: boolean
}

export const AdministrativoInit = Administrativo.init(
  {
    administrativo_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    persona_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "personas",
        key: "persona_id",
      },
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    fecha_contratacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "sedes",
        key: "sede_id",
      },
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "administrativos",
    timestamps: false,
  },
)
