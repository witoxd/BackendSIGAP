import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

export type NivelEducativo = "Preescolar" | "Primaria" | "Secundaria" | "Media"

interface CursoAttributes {
  curso_id:         number
  grado:            string
  nivel:            NivelEducativo
  grupo:            string
  jornada_id:       number
  capacidad_maxima: number
  activo:           boolean
}

export interface CursoCreationAttributes
  extends Optional<CursoAttributes, "curso_id" | "capacidad_maxima" | "activo"> {}

export class Curso
  extends Model<CursoAttributes, CursoCreationAttributes>
  implements CursoAttributes
{
  public curso_id!:         number
  public grado!:            string
  public nivel!:            NivelEducativo
  public grupo!:            string
  public jornada_id!:       number
  public capacidad_maxima!: number
  public activo!:           boolean
}

Curso.init(
  {
    curso_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    grado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Transición, 1, 2, ... 11",
    },
    nivel: {
      type: DataTypes.ENUM("Preescolar", "Primaria", "Secundaria", "Media"),
      allowNull: false,
    },
    grupo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "A, B, C ...",
    },
    jornada_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "jornadas", key: "jornada_id" },
    },
    capacidad_maxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 40,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "cursos",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["grado", "grupo", "jornada_id"],
        name: "uq_curso_grado_grupo_jornada",
      },
    ],
  }
)
