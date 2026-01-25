import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface MatriculaAttributes {
  matricula_id: number
  estudiante_id: number
  profesor_id:number
  curso_id: number
  fecha_matricula: Date
  jornada_id: number
  estado: "activa" | "finalizada" | "retirada"
  anio_egreso: number
}

export interface MatriculaCreationAttributes extends Optional<MatriculaAttributes, "matricula_id" | "fecha_matricula"> {}

export class Matricula extends Model<MatriculaAttributes, MatriculaCreationAttributes> implements MatriculaAttributes {
  public matricula_id!: number
  public estudiante_id!: number
  public profesor_id!:number
  public curso_id!: number
  public fecha_matricula!: Date
  public jornada_id!: number
  public estado!: "activa" | "finalizada" | "retirada"
  public anio_egreso!: number
}

Matricula.init(
  {
    matricula_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    estudiante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "estudiantes",
        key: "estudiante_id",
      },
    },
        jornada_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "jornadas",
        key: "jornada_id",
      },
    },
    profesor_id:{
    type: DataTypes.INTEGER,
    allowNull: false,
    references:{
      model: "profesores",
      key: "profesor_id"
    }
    },
    curso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cursos",
        key: "curso_id",
      },
    },
    fecha_matricula: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
    },
    estado: {
      type: DataTypes.ENUM("activa", "finalizada", "retirada"),
      allowNull: false,
      defaultValue: "activa",
    },
    anio_egreso:{
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: sequelize.literal("EXTRACT(YEAR FROM CURRENT_DATE)")
    }
  },
  {
    sequelize,
    tableName: "matriculas",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["estudiante_id", "curso_id"],
      },
    ],
  },
)
