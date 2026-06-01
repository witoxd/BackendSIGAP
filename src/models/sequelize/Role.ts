import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface RoleAttributes {
  role_id: number
  nombre: string
  descripcion?: string
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "role_id" | "descripcion"> {}

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public role_id!: number
  public nombre!: string
  public descripcion?: string
}

Role.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: false,
  },
)
