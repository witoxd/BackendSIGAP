import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"


interface ProfesorAttributes {
  profesor_id: number
  persona_id: number
  fecha_contratacion: Date
  estado: "activo" | "inactivo"
}

export interface ProfesorCreationAttributes extends Optional<ProfesorAttributes, "profesor_id" | "estado"> { }

export class Profesor extends Model<ProfesorAttributes, ProfesorCreationAttributes> implements ProfesorAttributes {
  public profesor_id!: number
  public persona_id!: number
  public fecha_contratacion!: Date
  public estado!: "activo" | "inactivo"
}

Profesor.init(
  {
    profesor_id: {
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
    fecha_contratacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "activo"
    }
  },
  {
    sequelize,
    tableName: "profesores",
    timestamps: false,
  },
)
