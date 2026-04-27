import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

// Proceso de inscripcion, defnira cuando matricular
// Deberia agregar el update_at???
interface ProcesoInscripcionAttributes {
  proceso_id: number
  periodo_id: number
  nombre: string
  fecha_inicio_inscripcion: Date
  fecha_fin_inscripcion: Date
  activo: boolean
  created_at?: Date
}

export interface ProcesoInscripcionCreationAttributes
  extends Optional<
    ProcesoInscripcionAttributes,
    "proceso_id" | "activo" | "created_at"
  > {}

export class ProcesoInscripcion
  extends Model<ProcesoInscripcionAttributes, ProcesoInscripcionCreationAttributes>
  implements ProcesoInscripcionAttributes
{
  public proceso_id!: number
  public periodo_id!: number
  public nombre!: string
  public fecha_inicio_inscripcion!: Date
  public fecha_fin_inscripcion!: Date
  public activo!: boolean
  public created_at?: Date
}

ProcesoInscripcion.init(
  {
    proceso_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    periodo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "periodos_matricula", key: "periodo_id" },
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Ej: Ordinaria, Extraordinaria, Especial",
    },
    fecha_inicio_inscripcion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_fin_inscripcion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName: "procesos_inscripcion",
    timestamps: false,
  },
)
