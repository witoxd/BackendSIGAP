import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface AsignacionDocenteAttributes {
  asignacion_id:   number
  curso_id:        number
  profesor_id:     number
  periodo_id:      number
  materia:         string
  horas_semanales: number | null
}

export interface AsignacionDocenteCreationAttributes
  extends Optional<AsignacionDocenteAttributes, "asignacion_id" | "horas_semanales"> {}

export class AsignacionDocente
  extends Model<AsignacionDocenteAttributes, AsignacionDocenteCreationAttributes>
  implements AsignacionDocenteAttributes
{
  public asignacion_id!:   number
  public curso_id!:        number
  public profesor_id!:     number
  public periodo_id!:      number
  public materia!:         string
  public horas_semanales!: number | null
}

AsignacionDocente.init(
  {
    asignacion_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    curso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cursos",            key: "curso_id"    },
    },
    profesor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "profesores",         key: "profesor_id" },
    },
    periodo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "periodos_matricula", key: "periodo_id"  },
    },
    materia: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    horas_semanales: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "asignacion_docente",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["curso_id", "profesor_id", "periodo_id", "materia"],
        name: "uq_asignacion_curso_profesor_periodo_materia",
      },
    ],
  }
)
