import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface JornadaAttributes {
  jornada_id: number
  nombre: string
  hora_inicio?: string
  hora_fin?: string
}

export interface JornadaCreationAttributes extends Optional<JornadaAttributes, "jornada_id"> {}

export class Jornada extends Model<JornadaAttributes, JornadaCreationAttributes> implements JornadaAttributes {
  public jornada_id!: number
  public nombre!: string
  public hora_inicio?: string
  public hora_fin?: string
}

Jornada.init(
  {
    jornada_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "jornadas",
    timestamps: false,
  },
)
