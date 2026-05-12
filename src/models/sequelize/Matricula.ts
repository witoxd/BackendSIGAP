import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface MatriculaAttributes {
  matricula_id:       number
  estudiante_id:      number
  curso_id:           number
  periodo_id:         number
  fecha_matricula:    Date
  estado:             "activa" | "finalizada" | "retirada"
  fecha_retiro?:      Date
  motivo_retiro?:     string
  url_firma_alumno?:  string
  url_firma_acudiente?: string
}

export interface MatriculaCreationAttributes
  extends Optional<
    MatriculaAttributes,
    | "matricula_id"
    | "fecha_matricula"
    | "fecha_retiro"
    | "motivo_retiro"
    | "url_firma_alumno"
    | "url_firma_acudiente"
  > {}

export class Matricula
  extends Model<MatriculaAttributes, MatriculaCreationAttributes>
  implements MatriculaAttributes
{
  public matricula_id!:         number
  public estudiante_id!:        number
  public curso_id!:             number
  public periodo_id!:           number
  public fecha_matricula!:      Date
  public estado!:               "activa" | "finalizada" | "retirada"
  public fecha_retiro?:         Date
  public motivo_retiro?:        string
  public url_firma_alumno?:     string
  public url_firma_acudiente?:  string
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
      references: { model: "estudiantes", key: "estudiante_id" },
    },
    curso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cursos", key: "curso_id" },
    },
    periodo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "periodos_matricula", key: "periodo_id" },
    },
    fecha_matricula: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    estado: {
      type: DataTypes.ENUM("activa", "finalizada", "retirada"),
      allowNull: false,
      defaultValue: "activa",
    },
    fecha_retiro: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha en que el estudiante se retiró",
    },
    motivo_retiro: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    url_firma_alumno: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "TODO: firma digital del alumno — pendiente definición con rectoría",
    },
    url_firma_acudiente: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "TODO: firma digital del acudiente — pendiente definición con rectoría",
    },
  },
  {
    sequelize,
    tableName: "matriculas",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["estudiante_id", "periodo_id"],
        name: "uq_matricula_estudiante_periodo",
      },
    ],
  }
)
