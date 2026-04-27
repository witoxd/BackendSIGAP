import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

//Periodo de la Matricula, el tiempo de vida.
// Por fin me quito esa incertidumbre de que le faltaba algo a matricula

interface PeriodoMatriculaAttributes {
  periodo_id: number
  anio: number
  fecha_inicio: Date
  fecha_fin: Date
  activo: boolean
  descripcion?: string
  created_by?: number
  created_at?: Date
}

export interface PeriodoMatriculaCreationAttributes
  extends Optional<
    PeriodoMatriculaAttributes,
    | "periodo_id"
    | "activo"
    | "descripcion"
    | "created_by"
    | "created_at"
  > { }

export class PeriodoMatricula
  extends Model<PeriodoMatriculaAttributes, PeriodoMatriculaCreationAttributes>
  implements PeriodoMatriculaAttributes {
  public periodo_id!: number
  public anio!: number
  public fecha_inicio!: Date
  public fecha_fin!: Date
  public activo!: boolean
  public descripcion?: string
  public created_by?: number
  public created_at?: Date
}

PeriodoMatricula.init(
  {
    periodo_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    anio: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 2000, max: 2900 }, //iba a poner 2100 pero mejor dejar un margen por si acaso
      comment: "Año escolar al que corresponde este período",
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Solo un período puede estar activo — garantizado por índice parcial UNIQUE WHERE activo = true",
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "usuarios", key: "usuario_id" },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName: "periodos_matricula",
    timestamps: false,
  },
)
