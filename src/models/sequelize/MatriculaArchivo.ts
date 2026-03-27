import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

// ------------------------------------------------------------
// MatriculaArchivo — tabla intermedia M:N entre matriculas y archivos
//
// Un archivo (documento de identidad, boletín, etc.) vive en
// la tabla `archivos` asociado a la persona. Esta tabla
// simplemente dice "este archivo fue presentado para esta matrícula".
//
// Ventaja: el documento de identidad se sube una vez y puede
// asociarse a múltiples matrículas sin duplicar el archivo físico.
// ------------------------------------------------------------

interface MatriculaArchivoAttributes {
  id:               number
  matricula_id:     number
  archivo_id:       number
  fecha_asociacion: Date
}

export interface MatriculaArchivoCreationAttributes
  extends Optional<MatriculaArchivoAttributes, "id" | "fecha_asociacion"> {}

export class MatriculaArchivo
  extends Model<MatriculaArchivoAttributes, MatriculaArchivoCreationAttributes>
  implements MatriculaArchivoAttributes
{
  public id!:               number
  public matricula_id!:     number
  public archivo_id!:       number
  public fecha_asociacion!: Date
}

MatriculaArchivo.init(
  {
    id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },
    matricula_id: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      references: { model: "matriculas", key: "matricula_id" },
    },
    archivo_id: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      references: { model: "archivos", key: "archivo_id" },
    },
    fecha_asociacion: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName:  "matricula_archivos",
    timestamps: false,
    indexes: [
      {
        // Un mismo archivo no puede asociarse dos veces
        // a la misma matrícula
        unique: true,
        fields: ["matricula_id", "archivo_id"],
      },
    ],
  },
)
