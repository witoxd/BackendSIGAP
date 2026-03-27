import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

// ------------------------------------------------------------
// PeriodoMatricula — controla cuándo está abierto el proceso
// de matrícula. Solo puede haber UN período activo al mismo
// tiempo, garantizado por un índice parcial en la BD.
//
// El backend resuelve el período activo automáticamente —
// el cliente nunca envía periodo_id en sus requests.
// ------------------------------------------------------------

interface PeriodoMatriculaAttributes {
  periodo_id:   number
  anio:         number        // Año escolar, ej: 2025
  fecha_inicio: Date          // Cuándo abre el proceso
  fecha_fin:    Date          // Cuándo cierra el proceso
  activo:       boolean       // El admin lo habilita/deshabilita
  descripcion?: string        // Opcional, ej: "Matrícula ordinaria 2025"
  created_by?:  number        // usuario_id de quien lo creó
  created_at?:  Date
}

export interface PeriodoMatriculaCreationAttributes
  extends Optional<
    PeriodoMatriculaAttributes,
    | "periodo_id"
    | "activo"
    | "descripcion"
    | "created_by"
    | "created_at"
  > {}

export class PeriodoMatricula
  extends Model<PeriodoMatriculaAttributes, PeriodoMatriculaCreationAttributes>
  implements PeriodoMatriculaAttributes
{
  public periodo_id!:   number
  public anio!:         number
  public fecha_inicio!: Date
  public fecha_fin!:    Date
  public activo!:       boolean
  public descripcion?:  string
  public created_by?:   number
  public created_at?:   Date
}

PeriodoMatricula.init(
  {
    periodo_id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },
    anio: {
      type:      DataTypes.SMALLINT,
      allowNull: false,
      validate:  { min: 2000, max: 2100 },
      comment:   "Año escolar al que corresponde este período",
    },
    fecha_inicio: {
      type:      DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_fin: {
      type:      DataTypes.DATEONLY,
      allowNull: false,
    },
    activo: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: false,
      comment:      "Solo un período puede estar activo — garantizado por índice parcial UNIQUE WHERE activo = true",
    },
    descripcion: {
      type:      DataTypes.STRING(200),
      allowNull: true,
    },
    created_by: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      references: { model: "usuarios", key: "usuario_id" },
    },
    created_at: {
      type:         DataTypes.DATE,
      allowNull:    true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName:  "periodos_matricula",
    timestamps: false,
    // El índice parcial se crea en la migración SQL, no aquí,
    // porque Sequelize no soporta índices parciales nativamente:
    //
    //   CREATE UNIQUE INDEX idx_un_periodo_activo
    //   ON periodos_matricula(activo)
    //   WHERE activo = true;
    //
    // Eso garantiza que si intentas activar un segundo período
    // la BD rechaza el INSERT/UPDATE antes de que el código lo vea.
  },
)
