import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface ProfesorAttributes {
  profesor_id:        number
  docente_id:         number
  fecha_nombramiento?: Date
  numero_resolucion?:  string
  titulo?:             string
  perfil_profesional?: string
  posgrado?:           string
  grado_escalafon?:    string
  area?:               string
}

export interface ProfesorCreationAttributes
  extends Optional<ProfesorAttributes, "profesor_id" | "fecha_nombramiento" | "numero_resolucion" | "titulo" | "perfil_profesional" | "posgrado" | "grado_escalafon" | "area"> {}

export class Profesor
  extends Model<ProfesorAttributes, ProfesorCreationAttributes>
  implements ProfesorAttributes
{
  public profesor_id!:         number
  public docente_id!:          number
  public fecha_nombramiento?:  Date
  public numero_resolucion?:   string
  public titulo?:              string
  public perfil_profesional?:  string
  public posgrado?:            string
  public grado_escalafon?:     string
  public area?:                string
}

Profesor.init(
  {
    profesor_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    docente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "docente", key: "docente_id" },
    },
    fecha_nombramiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    numero_resolucion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    perfil_profesional: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    posgrado: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    grado_escalafon: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "profesores",
    timestamps: false,
  }
)
