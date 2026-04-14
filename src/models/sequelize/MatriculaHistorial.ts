import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

// ----------------------------------------------------------
// MatriculaHistorial — snapshot inmutable de cada cambio.
// Cada vez que se cambia el curso/jornada/estado de una matrícula,
// ----------------------------------------------------------

interface MatriculaHistorialAttributes {
  historial_id: number
  matricula_id: number
  curso_id_anterior: number
  jornada_id_anterior: number
  estado_anterior: string
  curso_id_nuevo: number
  jornada_id_nuevo: number
  estado_nuevo: string
  modificado_por?: number
  modificado_en: Date
  motivo_cambio?: string
}

export interface MatriculaHistorialCreationAttributes
  extends Optional<MatriculaHistorialAttributes, 
    "historial_id" | "modificado_por" | "modificado_en" | "motivo_cambio"> {}

export class MatriculaHistorial
  extends Model<MatriculaHistorialAttributes, MatriculaHistorialCreationAttributes>
  implements MatriculaHistorialAttributes
{
  public historial_id!: number
  public matricula_id!: number
  public curso_id_anterior!: number
  public jornada_id_anterior!: number
  public estado_anterior!: string
  public curso_id_nuevo!: number
  public jornada_id_nuevo!: number
  public estado_nuevo!: string
  public modificado_por?: number
  public modificado_en!: Date
  public motivo_cambio?: string
}

MatriculaHistorial.init(
  {
    historial_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    matricula_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "matriculas", key: "matricula_id" },
    },
    curso_id_anterior: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jornada_id_anterior: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado_anterior: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    curso_id_nuevo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jornada_id_nuevo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado_nuevo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    modificado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "usuarios", key: "usuario_id" },
    },
    modificado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    motivo_cambio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "matriculas_historial",
    timestamps: false,
  }
)