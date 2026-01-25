import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface EstudianteAttributes {
  estudiante_id: number
  persona_id: number
  sede_id: number
  estado: "activo" | "inactivo" | "graduado" | "suspendido" | "expulsado"
  fecha_ingreso: Date
}

export interface EstudianteCreationAttributes extends Optional<EstudianteAttributes, "estudiante_id" | "estado" > {}

export class Estudiante
  extends Model<EstudianteAttributes, EstudianteCreationAttributes>
  implements EstudianteAttributes
{
  public estudiante_id!: number
  public persona_id!: number
  public sede_id!: number
  public estado!: "activo" | "inactivo" | "graduado" | "suspendido" | "expulsado"
  public fecha_ingreso!: Date
}

Estudiante.init(
  {
    estudiante_id: {
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
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sedes",
        key: "sede_id"
      },
    },
    estado: {
      type: DataTypes.ENUM("activo", "inactivo", "graduado", "suspendido", "expulsado"),
      allowNull: false,
      defaultValue: "activo",
    },
    fecha_ingreso: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
    },
  },
  {
    sequelize,
    tableName: "estudiantes",
    timestamps: false,
  },
)
