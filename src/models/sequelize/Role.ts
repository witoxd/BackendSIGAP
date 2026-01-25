import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface RoleAttributes {
  role_id: number
  nombre: "admin" | "profesor" | "estudiante" | "administrativo"
  descripcion?: string
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "role_id" | "descripcion"> {}

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public role_id!: number
  public nombre!: "admin" | "profesor" | "estudiante" | "administrativo"
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
      type: DataTypes.ENUM("admin", "profesor", "estudiante", "administrativo"),
      allowNull: false
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
