import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface AdministrativoAttributes {
  administrativo_id: number
  docente_id:        number
}

export interface AdministrativoCreationAttributes
  extends Optional<AdministrativoAttributes, "administrativo_id"> {}

export class Administrativo
  extends Model<AdministrativoAttributes, AdministrativoCreationAttributes>
  implements AdministrativoAttributes
{
  public administrativo_id!: number
  public docente_id!:        number
}

export const AdministrativoInit = Administrativo.init(
  {
    administrativo_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    docente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "docente", key: "docente_id" },
    },
  },
  {
    sequelize,
    tableName: "administrativos",
    timestamps: false,
  }
)
