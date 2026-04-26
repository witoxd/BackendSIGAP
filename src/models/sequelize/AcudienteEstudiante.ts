import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface AcudienteEstudianteAttributes {
  acudiente_estudiante_id: number
  estudiante_id: number
  acudiente_id: number
  tipo_relacion?: string
  es_principal?: boolean
}

export interface AcudienteEstudianteCreationAttributes
  extends Optional<AcudienteEstudianteAttributes, "acudiente_estudiante_id"> { }

export class AcudienteEstudiante
  extends Model<AcudienteEstudianteAttributes, AcudienteEstudianteCreationAttributes>
  implements AcudienteEstudianteAttributes {
  public acudiente_estudiante_id!: number
  public estudiante_id!: number
  public acudiente_id!: number
  public tipo_relacion?: string
  public es_principal?: boolean

}

AcudienteEstudiante.init(
  {
    acudiente_estudiante_id: {
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
    acudiente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "acudientes",
        key: "acudiente_id",
      },
    },
    tipo_relacion: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    es_principal: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "acudiente_estudiante",
    timestamps: false,
  },
)
