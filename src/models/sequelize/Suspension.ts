import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface SuspensionAttributes {
  suspension_id:  number
  estudiante_id:  number
  matricula_id?:  number | null
  motivo:         string
  fecha_inicio:   Date
  fecha_fin:      Date
  creado_por?:    number | null
  created_at?:    Date
}

export interface SuspensionCreationAttributes
  extends Optional<SuspensionAttributes, "suspension_id" | "matricula_id" | "creado_por" | "created_at"> {}

export class Suspension
  extends Model<SuspensionAttributes, SuspensionCreationAttributes>
  implements SuspensionAttributes
{
  public suspension_id!: number
  public estudiante_id!: number
  public matricula_id!:  number | null
  public motivo!:        string
  public fecha_inicio!:  Date
  public fecha_fin!:     Date
  public creado_por!:    number | null
  public created_at!:    Date
}

Suspension.init(
  {
    suspension_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    estudiante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "estudiantes", key: "estudiante_id" },
      onDelete: "CASCADE",
    },
    matricula_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "matriculas", key: "matricula_id" },
      onDelete: "SET NULL",
    },
    motivo:       { type: DataTypes.TEXT,    allowNull: false },
    fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_fin:    { type: DataTypes.DATEONLY, allowNull: false },
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "usuarios", key: "usuario_id" },
      onDelete: "SET NULL",
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "suspensiones",
    timestamps: false,
  },
)
