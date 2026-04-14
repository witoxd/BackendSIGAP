import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"


interface ReemplazoProfesorAttributes {
  reemplazo_id: number
  profesor_id: number           
  reemplaza_a_profesor_id: number 
  fecha_inicio: Date
  fecha_fin?: Date
  motivo?: string
}

export interface ReemplazoProfesorCreationAttributes
  extends Optional<ReemplazoProfesorAttributes, "reemplazo_id" | "fecha_fin" | "motivo"> {}

export class ReemplazoProfesor
  extends Model<ReemplazoProfesorAttributes, ReemplazoProfesorCreationAttributes>
  implements ReemplazoProfesorAttributes
{
  public reemplazo_id!: number
  public profesor_id!: number
  public reemplaza_a_profesor_id!: number
  public fecha_inicio!: Date
  public fecha_fin?: Date
  public motivo?: string
}

ReemplazoProfesor.init(
  {
    reemplazo_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    profesor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "profesores", key: "profesor_id" },
      comment: "Profesor que hace el reemplazo",
    },
    reemplaza_a_profesor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "profesores", key: "profesor_id" },
      comment: "Profesor que está siendo reemplazado",
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "null = reemplazo vigente",
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "reemplazos_profesor",
    timestamps: false,
  }
)