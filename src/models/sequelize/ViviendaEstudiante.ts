import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

// ------------------------------------------------------------
// ViviendaEstudiante — características del hogar
// Relación 1:1 con estudiantes.
// 


interface ViviendaEstudianteAttributes {
  vivienda_id: number
  estudiante_id: number
  tipo_paredes?: string   
  tipo_techo?: string     
  tipo_pisos?: string     
  num_banos?: number
  num_cuartos?: number
  updated_at?: Date
}

export interface ViviendaEstudianteCreationAttributes
  extends Optional<
    ViviendaEstudianteAttributes,
    | "vivienda_id"
    | "tipo_paredes"
    | "tipo_techo"
    | "tipo_pisos"
    | "num_banos"
    | "num_cuartos"
    | "updated_at"
  > {}

export class ViviendaEstudiante
  extends Model<ViviendaEstudianteAttributes, ViviendaEstudianteCreationAttributes>
  implements ViviendaEstudianteAttributes
{
  public vivienda_id!: number
  public estudiante_id!: number
  public tipo_paredes?: string
  public tipo_techo?: string
  public tipo_pisos?: string
  public num_banos?: number
  public num_cuartos?: number
  public updated_at?: Date
}

ViviendaEstudiante.init(
  {
    vivienda_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    estudiante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,              // 1:1 — un estudiante, una vivienda
      references: {
        model: "estudiantes",
        key: "estudiante_id",
      },
    },
    tipo_paredes: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    tipo_techo: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    tipo_pisos: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    num_banos: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      validate: { min: 0 },
    },
    num_cuartos: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      validate: { min: 0 },
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName: "vivienda_estudiante",
    timestamps: false,
  },
)