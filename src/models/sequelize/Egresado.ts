import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

// Egresados de la institucion, falta implementar las funciones para esta tabla
// Relacion 1:N con estudiantes
interface EgresadoAttributes {
  egresado_id: number
  estudiante_id: number
  fecha_grado?: Date
}

export interface EgresadoCreationAttributes extends Optional<EgresadoAttributes, "egresado_id"> { }

export class Egresado extends Model<EgresadoAttributes, EgresadoCreationAttributes> implements EgresadoAttributes {
  public egresado_id!: number
  public estudiante_id!: number
  public fecha_grado?: Date

}

Egresado.init(
  {
    egresado_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    estudiante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "estudiantes",
        key: "estudiante_id",
      },
    },
    fecha_grado: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "egresados",
    timestamps: false,
  },
)
