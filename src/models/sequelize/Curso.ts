import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

 interface CursoAttributes {
  curso_id: number
  nombre: string
  grado: string
  descripcion?: string
}

export interface CursoCreationAttributes extends Optional<CursoAttributes, "curso_id" | "descripcion" |  "nombre"> { }

export class Curso extends Model<CursoAttributes, CursoCreationAttributes> implements CursoAttributes {
  public curso_id!: number
  public nombre!: string
  public descripcion?: string
  public grado!: string
}

Curso.init(
  {
    curso_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    grado: {
      type: DataTypes.STRING(20),
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "cursos",
    timestamps: false,
  }
)
