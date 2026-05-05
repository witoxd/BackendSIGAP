import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface ProfesorContactoEmergenciaAttributes {
  contacto_emergencia_id: number
  profesor_id: number
  nombre: string
  parentesco: string
  telefono: string
  celular?: string | null
  activo: boolean
}

export interface ProfesorContactoEmergenciaCreationAttributes
  extends Optional<ProfesorContactoEmergenciaAttributes, "contacto_emergencia_id" | "celular" | "activo"> {}

export class ProfesorContactoEmergencia
  extends Model<ProfesorContactoEmergenciaAttributes, ProfesorContactoEmergenciaCreationAttributes>
  implements ProfesorContactoEmergenciaAttributes {
  public contacto_emergencia_id!: number
  public profesor_id!: number
  public nombre!: string
  public parentesco!: string
  public telefono!: string
  public celular?: string | null
  public activo!: boolean
}

ProfesorContactoEmergencia.init(
  {
    contacto_emergencia_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    profesor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "profesores", key: "profesor_id" },
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    parentesco: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "profesor_contactos_emergencia",
    timestamps: false,
  }
)
