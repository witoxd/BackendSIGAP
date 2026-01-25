import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface ArchivosAttributes {
  Archivo_id: number
  persona_id: number
  nombre: string
  descripcion?: string
  tipo_archivo: "certificado" | "diploma" | "constancia" | "carta" | "photo" | "otro"
  url_archivo: string
  fecha_carga: Date
  asignado_por?: number
  activo: boolean
}

export interface ArchivosCreationAttributes
  extends Optional<
    ArchivosAttributes,
    "Archivo_id" | "descripcion" | "fecha_carga" | "asignado_por"
  > { }

export class Archivos extends Model<ArchivosAttributes, ArchivosCreationAttributes> implements ArchivosAttributes {
  public Archivo_id!: number
  public persona_id!: number
  public nombre!: string
  public descripcion?: string
  public tipo_archivo!: "certificado" | "diploma" | "constancia" | "carta" | "photo" | "otro"
  public url_archivo!: string
  public fecha_carga!: Date
  public asignado_por?: number
  public activo!: boolean
}

Archivos.init(
  {
    Archivo_id: {
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
    tipo_archivo: {
      type: DataTypes.ENUM("certificado", "diploma", "constancia", "carta", "photo", "otro"),
      allowNull: false,
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
      defaultValue: DataTypes.NOW,
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
  },
)
