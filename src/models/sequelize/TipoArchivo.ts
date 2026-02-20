import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface TipoArchivoAttributes {
  tipo_archivo_id: number
  nombre: string
  descripcion?: string
  extensiones_permitidas?: string[]
  activo: boolean
}

export interface TipoArchivoCreationAttributes 
  extends Optional<TipoArchivoAttributes, "tipo_archivo_id" | "descripcion" | "extensiones_permitidas" | "activo"> {}

export class TipoArchivo 
  extends Model<TipoArchivoAttributes, TipoArchivoCreationAttributes> 
  implements TipoArchivoAttributes {
  public tipo_archivo_id!: number
  public nombre!: string
  public descripcion?: string
  public extensiones_permitidas?: string[]
  public activo!: boolean
}

TipoArchivo.init(
  {
    tipo_archivo_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    extensiones_permitidas: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      comment: "Array de extensiones permitidas: ['.pdf', '.jpg', '.png']",
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "tipos_archivo",
    timestamps: false,
  }
)
