import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface AcudienteAttributes {
  acudiente_id: number
  persona_id: number
  parentesco?: string
}

export interface AcudienteCreationAttributes extends Optional<AcudienteAttributes, "acudiente_id"> {}

export class Acudiente extends Model<AcudienteAttributes, AcudienteCreationAttributes> implements AcudienteAttributes {
  public acudiente_id!: number
  public persona_id!: number
  public parentesco?: string

}

Acudiente.init(
  {
    acudiente_id: {
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
    parentesco: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "acudientes",
    timestamps: false,
  },
)
