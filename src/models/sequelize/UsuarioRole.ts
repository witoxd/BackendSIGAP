import { DataTypes, Model, Sequelize } from "sequelize"
import { sequelize } from "../../config/database"

interface UsuarioRoleAttributes {
  usuario_role_id: number
  usuario_id: number
  role_id: number
  fecha_asignacion: Date
}

export class UsuarioRole extends Model<UsuarioRoleAttributes> implements UsuarioRoleAttributes {
  public usuario_role_id!: number
  public usuario_id!: number
  public role_id!: number
  public fecha_asignacion!: Date
}

UsuarioRole.init(
  {
    usuario_role_id: {
  type: DataTypes.INTEGER,
  autoIncrement: true,
  primaryKey: true,
},
  usuario_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: "usuarios",
    key: "usuario_id",
  },
},
  role_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: "roles",
    key: "role_id",
  },
},
  fecha_asignacion: {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")

},
  },
  {
    sequelize,
    tableName: "usuarios_role",
    timestamps: false,
  },
)
