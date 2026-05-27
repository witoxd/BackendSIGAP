import { DataTypes, Model, Sequelize, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

export type EstadoSesion = "activa" | "cerrada" | "expirada" | "revocada_por_robo"

interface SesionAttributes {
  sesion_id: number
  usuario_id: number
  familia: string
  ip_address: string | null
  user_agent: string | null
  fecha_login: Date
  fecha_cierre: Date | null
  estado: EstadoSesion
}

interface SesionCreationAttributes
  extends Optional<SesionAttributes, "sesion_id" | "ip_address" | "user_agent" | "fecha_login" | "fecha_cierre" | "estado"> {}

export class Sesion
  extends Model<SesionAttributes, SesionCreationAttributes>
  implements SesionAttributes
{
  declare sesion_id: number
  declare usuario_id: number
  declare familia: string
  declare ip_address: string | null
  declare user_agent: string | null
  declare fecha_login: Date
  declare fecha_cierre: Date | null
  declare estado: EstadoSesion
}

Sesion.init(
  {
    sesion_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "usuarios", key: "usuario_id" },
      onDelete: "CASCADE",
    },
    familia: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_login: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    fecha_cierre: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("activa", "cerrada", "expirada", "revocada_por_robo"),
      defaultValue: "activa",
    },
  },
  {
    sequelize,
    tableName: "sesiones",
    timestamps: false,
  },
)
