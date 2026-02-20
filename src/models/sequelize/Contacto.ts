import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface ContactoAttributes {
  contacto_id: number
  persona_id: number
  tipo_contacto: "telefono" | "celular" | "email" | "direccion" | "otro"
  valor: string
  es_principal: boolean
  activo: boolean
}

export interface ContactoCreationAttributes 
  extends Optional<ContactoAttributes, "contacto_id" | "es_principal" | "activo"> {}

export class Contacto 
  extends Model<ContactoAttributes, ContactoCreationAttributes> 
  implements ContactoAttributes {
  public contacto_id!: number
  public persona_id!: number
  public tipo_contacto!: "telefono" | "celular" | "email" | "direccion" | "otro"
  public valor!: string
  public es_principal!: boolean
  public activo!: boolean
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
  },
  {
    sequelize,
    tableName: "contactos",
    timestamps: false,
  }
)
