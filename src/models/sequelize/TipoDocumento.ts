import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface TipoDocumentoAttributes {
  tipo_documento_id: number
  tipo_documento: string
  nombre_documento: string
}

export interface TipoDocumentoCreationAttributes extends Optional<TipoDocumentoAttributes, "tipo_documento_id"> {}

export class TipoDocumento
  extends Model<TipoDocumentoAttributes, TipoDocumentoCreationAttributes>
  implements TipoDocumentoAttributes
{
  public tipo_documento_id!: number
  public tipo_documento!: string
  public nombre_documento!: string

}

TipoDocumento.init(
  {
    tipo_documento_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo_documento: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    nombre_documento:{
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "tipo_documento",
    timestamps: false,
  },
)
