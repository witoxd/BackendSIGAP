import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface ProfesorAttributes {
  profesor_id: number
  docente_id:  number
}

export interface ProfesorCreationAttributes
  extends Optional<ProfesorAttributes, "profesor_id"> {}

export class Profesor
  extends Model<ProfesorAttributes, ProfesorCreationAttributes>
  implements ProfesorAttributes
{
  public profesor_id!: number
  public docente_id!:  number
}

Profesor.init(
  {
    profesor_id: {
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
    tableName: "profesores",
    timestamps: false,
  }
)
