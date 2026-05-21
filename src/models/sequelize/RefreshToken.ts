import { DataTypes, Model, Sequelize, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface RefreshTokenAttributes {
  token_id: number
  usuario_id: number
  token: string
  expires_at: Date
  created_at: Date
  revoked: boolean
}

interface RefreshTokenCreationAttributes
  extends Optional<RefreshTokenAttributes, "token_id" | "created_at" | "revoked"> {}

export class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  declare token_id: number
  declare usuario_id: number
  declare token: string
  declare expires_at: Date
  declare created_at: Date
  declare revoked: boolean
}

RefreshToken.init(
  {
    token_id: {
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
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "refresh_tokens",
    timestamps: false,
  },
)
