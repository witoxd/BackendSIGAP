import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface PersonaAttributes {
  persona_id: number
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  tipo_documento_id: number
  numero_documento: string
  tipo_sangre: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  fecha_nacimiento: Date
  genero: "Masculino" | "Femenino" | "Otro"
}

export interface PersonaCreationAttributes extends Optional<PersonaAttributes, "persona_id" | "apellido_materno" | "apellido_paterno"> { }

export class Persona extends Model<PersonaAttributes, PersonaCreationAttributes> implements PersonaAttributes {
  public persona_id!: number
  public nombres!: string
  public apellido_paterno!: string
  public apellido_materno!: string
  public tipo_documento_id!: number
  public numero_documento!: string
  public tipo_sangre!: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  public fecha_nacimiento!: Date
  public genero!: "Masculino" | "Femenino" | "Otro"

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
        notEmpty: false,
        len: [2, 50],
      },
    },
    apellido_materno: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        notEmpty: false,
        len: [2, 50],
      },
    },
    tipo_documento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tipo_documento",
        key: "tipo_documento_id",
      }
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
    tipo_sangre: {
      type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
      allowNull: false,
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
  },
  {
    sequelize,
    tableName: "personas",
    timestamps: false,
  },
)
