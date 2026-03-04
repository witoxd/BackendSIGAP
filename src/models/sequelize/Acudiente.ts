import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface AcudienteAttributes {
  acudiente_id: number
  persona_id: number
  parentesco?: string
  ocupacion?: string       
  nivel_estudio?: string   
}

export interface AcudienteCreationAttributes
  extends Optional<
    AcudienteAttributes,
    | "acudiente_id"
    | "parentesco"
    | "ocupacion"
    | "nivel_estudio"
  > {}

export class Acudiente
  extends Model<AcudienteAttributes, AcudienteCreationAttributes>
  implements AcudienteAttributes
{
  public acudiente_id!: number
  public persona_id!: number
  public parentesco?: string
  public ocupacion?: string
  public nivel_estudio?: string

}

Acudiente.init(
  {
    acudiente_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    persona_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "personas",
        key: "persona_id",
      },
    },
    parentesco: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Ej: Padre, Madre, Tío, Abuelo, Hermano mayor",
    },
    ocupacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nivel_estudio: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Ej: Primaria, Bachillerato, Técnico, Universitario, Posgrado",
    }
  },
  {
    sequelize,
    tableName: "acudientes",
    timestamps: false,
  },
)