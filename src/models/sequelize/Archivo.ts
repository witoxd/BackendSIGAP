import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface ArchivosAttributes {
  archivo_id: number
  persona_id: number
  tipo_archivo_id: number
  nombre: string
  descripcion?: string
  url_archivo: string
  fecha_carga: Date
  asignado_por?: number
  activo: boolean
}

export interface ArchivosCreationAttributes
  extends Optional<
    ArchivosAttributes,
    "archivo_id" | "descripcion" | "fecha_carga" | "asignado_por" | "activo"
  > { }

export class Archivos extends Model<ArchivosAttributes, ArchivosCreationAttributes> implements ArchivosAttributes {
  public archivo_id!: number
  public persona_id!: number
  public tipo_archivo_id!: number
  public nombre!: string
  public descripcion?: string
  public url_archivo!: string
  public fecha_carga!: Date
  public asignado_por?: number
  public activo!: boolean
}

Archivos.init(
  {
    archivo_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    persona_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "personas",
        key: "persona_id",
      },
    },
    tipo_archivo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tipos_archivo",
        key: "tipo_archivo_id",
      },
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url_archivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    fecha_carga: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    asignado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "usuario_id",
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "archivos",
    timestamps: false,
  }
)
