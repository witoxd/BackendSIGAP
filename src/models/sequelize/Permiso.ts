import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

// Agregar funicones para despues
// Ni los endpoint estan implementados 
interface PermisoAttributes {
  permiso_id: number
  nombre: string
  descripcion?: string
  recurso: string
  accion: string
}

interface PermisoCreationAttributes extends Optional<PermisoAttributes, "permiso_id"> {}

export class Permiso extends Model<PermisoAttributes, PermisoCreationAttributes> implements PermisoAttributes {
  public permiso_id!: number
  public nombre!: string
  public descripcion?: string
  public recurso!:string
  public accion!:string

}

Permiso.init(
  {
    permiso_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recurso: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    accion: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "permisos",
    timestamps: false,
  },
)
