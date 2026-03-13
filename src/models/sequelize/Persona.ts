import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface PersonaAttributes {
  persona_id: number
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  tipo_documento_id: number
  numero_documento: string
  fecha_nacimiento: Date
  genero: "Masculino" | "Femenino" | "Otro"
  grupo_sanguineo?: string        
  grupo_etnico?: string
  credo_religioso?: string         
  lugar_nacimiento?: string        
  serial_registro_civil?: string   
  expedida_en?: string             
}

export interface PersonaCreationAttributes
  extends Optional<
    PersonaAttributes,
    | "persona_id"
    | "apellido_materno"
    | "apellido_paterno"
    | "grupo_sanguineo"
    | "grupo_etnico"
    | "credo_religioso"
    | "lugar_nacimiento"
    | "serial_registro_civil"
    | "expedida_en"
  > {}

export class Persona
  extends Model<PersonaAttributes, PersonaCreationAttributes>
  implements PersonaAttributes
{
  public persona_id!: number
  public nombres!: string
  public apellido_paterno!: string
  public apellido_materno!: string
  public tipo_documento_id!: number
  public numero_documento!: string
  public fecha_nacimiento!: Date
  public genero!: "Masculino" | "Femenino" | "Otro"
  public grupo_sanguineo?: string
  public grupo_etnico?: string
  public credo_religioso?: string
  public lugar_nacimiento?: string
  public serial_registro_civil?: string
  public expedida_en?: string
}

Persona.init(
  {
    persona_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    apellido_paterno: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [2, 50],
      },
    },
    apellido_materno: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [2, 50],
      },
    },
    tipo_documento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tipo_documento",
        key: "tipo_documento_id",
      },
    },
    numero_documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [5, 20],
      },
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString(),
      },
    },
    genero: {
      type: DataTypes.ENUM("Masculino", "Femenino", "Otro"),
      allowNull: false,
    },

    // --- Nuevos campos ---
    grupo_sanguineo: {
      type: DataTypes.STRING(5),
      allowNull: true,
      validate: {
        // Valores válidos: A+, A-, B+, B-, AB+, AB-, O+, O-
        isIn: [["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
      },
    },
    grupo_etnico: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    credo_religioso: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    lugar_nacimiento: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    serial_registro_civil: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Serial del Registro Civil — aplica cuando tipo_documento es T.I.",
    },
    expedida_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Ciudad/municipio donde fue expedido el documento de identidad",
    },
  },
  {
    sequelize,
    tableName: "personas",
    timestamps: false,
  },
)