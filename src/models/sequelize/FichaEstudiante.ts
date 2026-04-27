import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

// ------------------------------------------------------------
// FichaEstudiante — expediente completo del estudiante
// Relación 1:1 con estudiantes.
//
// Se llena gradualmente — ningún campo es obligatorio excepto
// estudiante_id. Usar upsert al guardar (INSERT ... ON CONFLICT).
// ------------------------------------------------------------

interface FichaEstudianteAttributes {
  ficha_id: number
  estudiante_id: number

  // Contexto escolar
  motivo_traslado?: string
  limitaciones_fisicas?: string
  otras_limitaciones?: string
  talentos_especiales?: string
  otras_actividades?: string

  // Contexto familiar
  numero_hermanos?: number
  posicion_hermanos?: number       // Posición entre los hermanos (1 = mayor) esto deberia cambairlo por un boolean
  nombre_hermano_mayor?: string
  parientes_hogar?: string         
  total_parientes?: number         

  // Datos médicos
  // Tener en cuenta que son datos sensibles, agregar en la docuemntacion
  eps_ars?: string
  alergia?: string
  centro_atencion_medica?: string

  // Transporte
  // Si el medio son "pies" se tomaria como transporte propio? seria muy mlp de mi parte.... me encanta
  medio_transporte?: string       
  transporte_propio?: boolean

  // Observaciones generales 
  observaciones?: string

  // Metadatos es mejor amnejarlos manuealmente 
  created_at?: Date
  updated_at?: Date
}

export interface FichaEstudianteCreationAttributes
  extends Optional<
    FichaEstudianteAttributes,
    | "ficha_id"
    | "motivo_traslado"
    | "limitaciones_fisicas"
    | "otras_limitaciones"
    | "talentos_especiales"
    | "otras_actividades"
    | "numero_hermanos"
    | "posicion_hermanos"
    | "nombre_hermano_mayor"
    | "parientes_hogar"
    | "total_parientes"
    | "eps_ars"
    | "alergia"
    | "centro_atencion_medica"
    | "medio_transporte"
    | "transporte_propio"
    | "observaciones"
    | "created_at"
    | "updated_at"
  > {}

export class FichaEstudiante
  extends Model<FichaEstudianteAttributes, FichaEstudianteCreationAttributes>
  implements FichaEstudianteAttributes
{
  public ficha_id!: number
  public estudiante_id!: number
  public motivo_traslado?: string
  public limitaciones_fisicas?: string
  public otras_limitaciones?: string
  public talentos_especiales?: string
  public otras_actividades?: string
  public numero_hermanos?: number
  public posicion_hermanos?: number
  public nombre_hermano_mayor?: string
  public parientes_hogar?: string
  public total_parientes?: number
  public eps_ars?: string
  public alergia?: string
  public centro_atencion_medica?: string
  public medio_transporte?: string
  public transporte_propio?: boolean
  public observaciones?: string
  public created_at?: Date
  public updated_at?: Date
}

FichaEstudiante.init(
  {
    ficha_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    estudiante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,              
      references: {
        model: "estudiantes",
        key: "estudiante_id",
      },
    },

    // Contexto escolar
    motivo_traslado: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    limitaciones_fisicas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    otras_limitaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    talentos_especiales: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    otras_actividades: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Contexto familiar
    numero_hermanos: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      validate: { min: 0 },
    },
    posicion_hermanos: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      validate: { min: 1 },
      comment: "Posición entre los hermanos — 1 es el mayor",
    },
    nombre_hermano_mayor: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    parientes_hogar: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Descripción libre de parientes que conviven: abuela, tío, etc.",
    },
    total_parientes: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      validate: { min: 0 },
    },

    // Datos médicos
    eps_ars: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    alergia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    centro_atencion_medica: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    // Transporte
    medio_transporte: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    transporte_propio: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },

    // Observaciones
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Metadatos
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
    },
  },
  {
    sequelize,
    tableName: "ficha_estudiante",
    timestamps: false,  // Manejamos manualmente con created_at / updated_at
  },
)