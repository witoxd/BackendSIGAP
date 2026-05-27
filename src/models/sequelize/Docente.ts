import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface DocenteAttributes {
  docente_id:          number
  persona_id:          number
  sede?:               string
  jornada_id?:         number
  tipo_contrato?:      string
  estado:              "activo" | "inactivo"
  fecha_contratacion:  Date
  // Campos académicos/profesionales (compartidos por todos los docentes)
  decreto_id?:           number
  titulo?:               string
  area?:                 string
  posgrado?:             string
  grado_escalafon_id?:   number
  fecha_nombramiento?:   Date
  numero_resolucion?:    string
  perfil_profesional?:   string
}

export interface DocenteCreationAttributes
  extends Optional<DocenteAttributes, "docente_id" | "estado" | "fecha_contratacion" | "decreto_id" | "titulo" | "area" | "posgrado" | "grado_escalafon_id" | "fecha_nombramiento" | "numero_resolucion" | "perfil_profesional"> {}

export class Docente
  extends Model<DocenteAttributes, DocenteCreationAttributes>
  implements DocenteAttributes
{
  public docente_id!:          number
  public persona_id!:          number
  public sede?:                string
  public jornada_id?:          number
  public tipo_contrato?:       string
  public estado!:              "activo" | "inactivo"
  public fecha_contratacion!:  Date
  public decreto_id?:          number
  public titulo?:              string
  public area?:                string
  public posgrado?:            string
  public grado_escalafon_id?:  number
  public fecha_nombramiento?:  Date
  public numero_resolucion?:   string
  public perfil_profesional?:  string
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
    decreto_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "decretos", key: "decreto_id" },
    },
    titulo: { type: DataTypes.STRING(150), allowNull: true },
    area: { type: DataTypes.STRING(100), allowNull: true },
    posgrado: { type: DataTypes.STRING(150), allowNull: true },
    grado_escalafon_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "grados_escalafon", key: "grado_id" },
    },
    fecha_nombramiento: { type: DataTypes.DATEONLY, allowNull: true },
    numero_resolucion: { type: DataTypes.STRING(100), allowNull: true },
    perfil_profesional: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "docente",
    timestamps: false,
  }
)
