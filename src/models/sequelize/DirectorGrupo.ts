import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

interface DirectorGrupoAttributes {
  director_id:  number
  curso_id:     number
  periodo_id:   number
  profesor_id:  number
}

export interface DirectorGrupoCreationAttributes
  extends Optional<DirectorGrupoAttributes, "director_id"> {}

export class DirectorGrupo
  extends Model<DirectorGrupoAttributes, DirectorGrupoCreationAttributes>
  implements DirectorGrupoAttributes
{
  public director_id!: number
  public curso_id!:    number
  public periodo_id!:  number
  public profesor_id!: number
}

DirectorGrupo.init(
  {
    director_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    curso_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cursos",            key: "curso_id"   },
    },
    periodo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "periodos_matricula", key: "periodo_id" },
    },
    profesor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "profesores",         key: "profesor_id" },
    },
  },
  {
    sequelize,
    tableName: "director_grupo",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["curso_id", "periodo_id"],
        name: "uq_director_curso_periodo",
      },
    ],
  }
)
