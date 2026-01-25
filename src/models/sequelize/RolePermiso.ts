import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface RolePermisoAttributes {
  role_permiso_id: number
  role_id: number
  permiso_id: number
}

interface RolePermisoCreationAttributes extends Optional<RolePermisoAttributes, "role_permiso_id"> { }

export class RolePermiso
  extends Model<RolePermisoAttributes, RolePermisoCreationAttributes>
  implements RolePermisoAttributes {
  public role_permiso_id!: number
  public role_id!: number
  public permiso_id!: number

}

RolePermiso.init(
  {
    role_permiso_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
      model: "roles",
      key: "role_id",
      },
    },
      permiso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
      model: "permisos",
      key: "permiso_id",
       },
      },
    },
  {
    sequelize,
    tableName: "role_permisos",
    timestamps: false,
  },
)
