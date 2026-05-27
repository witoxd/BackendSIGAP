import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface GradoEscalafonAttributes {
  grado_id:     number
  decreto_id:   number
  codigo:       string
  descripcion?: string
  orden:        number
}

export interface GradoEscalafonCreationAttributes extends Optional<GradoEscalafonAttributes, "grado_id" | "orden"> {}

export class GradoEscalafon
  extends Model<GradoEscalafonAttributes, GradoEscalafonCreationAttributes>
  implements GradoEscalafonAttributes
{
  public grado_id!:     number
  public decreto_id!:   number
  public codigo!:       string
  public descripcion?:  string
  public orden!:        number
}

GradoEscalafon.init(
  {
    grado_id:    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    decreto_id:  { type: DataTypes.INTEGER, allowNull: false, references: { model: "decretos", key: "decreto_id" } },
    codigo:      { type: DataTypes.STRING(10), allowNull: false },
    descripcion: { type: DataTypes.STRING(100), allowNull: true },
    orden:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: "grados_escalafon", timestamps: false }
)
