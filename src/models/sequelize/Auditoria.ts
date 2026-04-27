import { DataTypes, Model, Sequelize, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface AuditoriaAttributes {
  // Tabal de auditoria o mas bien historial, opino que hay que cambiarlo y en vez de una varias para distintas tablas, esta se queda corta.
  auditoria_id: number
  tabla_nombre: string
  accion: string
  usuario_id?: number
  fecha?: Date
  detalle?: object
}

interface AuditoriaCreationAttributes extends Optional<AuditoriaAttributes, "auditoria_id"> { }

export class Auditoria extends Model<AuditoriaAttributes, AuditoriaCreationAttributes> implements AuditoriaAttributes {
  public auditoria_id!: number
  public tabla_nombre!: string
  public accion!: string
  public usuario_id?: number
  public fecha?: Date
  public detalle?: object

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Auditoria.init(
  {
    auditoria_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tabla_nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    accion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "usuario_id",
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
    detalle: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "auditoria",
    timestamps: false,
  },
)
