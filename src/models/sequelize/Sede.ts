import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface SedeAttributes {
  sede_id: number
  nombre: string
  direccion?: string
}

export interface SedeCreationAttributes extends Optional<SedeAttributes, "sede_id"> {}

export class Sede extends Model<SedeAttributes, SedeCreationAttributes> implements SedeAttributes {
  public sede_id!: number
  public nombre!: string
  public direccion?: string

}

Sede.init(
  {
    sede_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    direccion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "sedes",
    timestamps: false,
  },
)
