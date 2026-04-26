import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"


// Contacto — información de contacto de personas
// Relación 1:N con personas (una persona puede tener múltiples contactos: teléfono, email, dirección, etc.)
// Dilema: Estudiante tambien es una persona tambien podra hacer uso de esta tabla????
// Tener en cuenta no repetir datos
interface ContactoAttributes {
  contacto_id: number
  persona_id: number
  tipo_contacto: "telefono" | "celular" | "email" | "direccion" | "otro"
  valor: string
  es_principal: boolean
  activo: boolean
  created_at?: Date | null
  updated_at?: Date | null
}

export interface ContactoCreationAttributes
  extends Optional<ContactoAttributes, "contacto_id" | "es_principal" | "activo" | "created_at" | "updated_at"> {}

export class Contacto
  extends Model<ContactoAttributes, ContactoCreationAttributes>
  implements ContactoAttributes {
  public contacto_id!: number
  public persona_id!: number
  public tipo_contacto!: "telefono" | "celular" | "email" | "direccion" | "otro"
  public valor!: string
  public es_principal!: boolean
  public activo!: boolean
  public created_at?: Date | null
  public updated_at?: Date | null
}

Contacto.init(
  {
    contacto_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    persona_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "personas",
        key: "persona_id",
      },
    },
    tipo_contacto: {
      type: DataTypes.ENUM("telefono", "celular", "email", "direccion", "otro"),
      allowNull: false,
    },
    valor: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    es_principal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "contactos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
)
