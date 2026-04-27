import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface MatriculaAttributes {
  matricula_id: number
  estudiante_id: number
  curso_id: number
  jornada_id: number
  periodo_id: number
  fecha_matricula: Date
  estado: "activa" | "finalizada" | "retirada"
  fecha_retiro?: Date
  motivo_retiro?: string

  // --- Campos futuros: firmas digitales ---
  // En el fichero de las matriculas habia un apartado de firmas, 
  // no especificaron si se agregara, de todos modos aqui estan para un futura implementacion.

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


  public curso_id!: number
  public jornada_id!: number
  public fecha_matricula!: Date
  public periodo_id!: number
  
  // Estado de la amtricula
  // Recordatorio, hay que aclarar sobre los distintos tipos de estados de una matricula,
  // al final no sabemos que pasara a futuro
  public estado!: "activa" | "finalizada" | "retirada"

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
    periodo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "periodos_matricula",
        key: "periodo_id",
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