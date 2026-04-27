import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"


// ColegioAnterior — historial de instituciones anteriores del estudiante
// Relación 1:N con estudiantes.

interface ColegioAnteriorAttributes {
  colegio_ant_id: number
  estudiante_id: number
  nombre_colegio: string
  ciudad?: string        
  grado_cursado?: string
  anio?: number
  orden?: number        
}

export interface ColegioAnteriorCreationAttributes
  extends Optional<
    ColegioAnteriorAttributes,
    | "colegio_ant_id"
    | "ciudad"
    | "grado_cursado"
    | "anio"
    | "orden"
  > {}

export class ColegioAnterior
  extends Model<ColegioAnteriorAttributes, ColegioAnteriorCreationAttributes>
  implements ColegioAnteriorAttributes
{
  public colegio_ant_id!: number
  public estudiante_id!: number
  public nombre_colegio!: string
  public ciudad?: string
  public grado_cursado?: string
  public anio?: number
  public orden?: number
}

ColegioAnterior.init(
  {
    colegio_ant_id: {
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
    nombre_colegio: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    grado_cursado: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    anio: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      validate: {
        min: 1900,
        max: new Date().getFullYear(),
      },
    },
    orden: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "colegios_anteriores",
    timestamps: false,
  },
)