import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface MatriculaAttributes {
  matricula_id: number
  estudiante_id: number
  profesor_id: number
  curso_id: number
  jornada_id: number
  fecha_matricula: Date
  estado: "activa" | "finalizada" | "retirada"
  anio_egreso: number
  fecha_retiro?: Date
  motivo_retiro?: string

  // --- Campos futuros: firmas digitales ---
  // Columnas creadas como nullable para no bloquear la implementación futura.
  // Cuando se implemente, guardarán la ruta del archivo de firma.
  // TODO: implementar endpoint PATCH /matriculas/:id/firmas
  url_firma_alumno?: string
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
  public matricula_id!: number
  public estudiante_id!: number

  // Esta referencia de profesor puede ser quitada a futuro
  // Dependiendo de como se maneje el proceso de matricula
  public profesor_id!: number
  public curso_id!: number
  public jornada_id!: number
  public fecha_matricula!: Date

  // Estado de la amtricula
  // Recordatorio, hay que aclarar sobre los distintos tipos de estados de una matricula,
  // al final no sabemos que pasara a futuro
  public estado!: "activa" | "finalizada" | "retirada"
  public anio_egreso!: number

  // Retiro
  public fecha_retiro?: Date
  public motivo_retiro?: string

  // Firmas (futuro), en el PDF se ve que hay unos campos de firmas
  // Hay que aclarar si se implementara o no al rector
  public url_firma_alumno?: string
  public url_firma_acudiente?: string
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
    profesor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "profesores",
        key: "profesor_id",
      },
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
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    estado: {
      type: DataTypes.ENUM("activa", "finalizada", "retirada"),
      allowNull: false,
      defaultValue: "activa",
    },
    anio_egreso: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: sequelize.literal("EXTRACT(YEAR FROM CURRENT_DATE)"),
    },

    // --- Retiro ---
    fecha_retiro: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha en que el estudiante se retiró en este año escolar específico",
    },
    motivo_retiro: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    // --- Firmas (futuro) ---
    url_firma_alumno: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "TODO: ruta de imagen de firma del alumno — implementar cuando se requiera",
    },
    url_firma_acudiente: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "TODO: ruta de imagen de firma del acudiente — implementar cuando se requiera",
    },
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