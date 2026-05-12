import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface DocenteAttributes {
  docente_id:         number
  persona_id:         number
  cargo?:             string
  sede?:              string
  jornada_id?:        number
  tipo_contrato?:     string
  estado:             "activo" | "inactivo"
  fecha_contratacion: Date
}

export interface DocenteCreationAttributes
  extends Optional<DocenteAttributes, "docente_id" | "estado" | "fecha_contratacion"> {}

export class Docente
  extends Model<DocenteAttributes, DocenteCreationAttributes>
  implements DocenteAttributes
{
  public docente_id!:         number
  public persona_id!:         number
  public cargo?:              string
  public sede?:               string
  public jornada_id?:         number
  public tipo_contrato?:      string
  public estado!:             "activo" | "inactivo"
  public fecha_contratacion!: Date
}

Docente.init(
  {
    docente_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    persona_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "personas", key: "persona_id" },
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sede: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    jornada_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "jornadas", key: "jornada_id" },
    },
    tipo_contrato: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "activo",
      validate: { isIn: [["activo", "inactivo"]] },
    },
    fecha_contratacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName: "docente",
    timestamps: false,
  }
)
