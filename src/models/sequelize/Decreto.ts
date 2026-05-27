import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface DecretoAttributes {
  decreto_id:   number
  codigo:       string
  nombre:       string
  descripcion?: string
}

export interface DecretoCreationAttributes extends Optional<DecretoAttributes, "decreto_id"> {}

export class Decreto extends Model<DecretoAttributes, DecretoCreationAttributes> implements DecretoAttributes {
  public decreto_id!: number
  public codigo!:     string
  public nombre!:     string
  public descripcion?: string
}

Decreto.init(
  {
    decreto_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigo:     { type: DataTypes.STRING(10), allowNull: false, unique: true },
    nombre:     { type: DataTypes.STRING(100), allowNull: false },
    descripcion:{ type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: "decretos", timestamps: false }
)
