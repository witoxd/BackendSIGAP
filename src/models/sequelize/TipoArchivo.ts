import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"

// ----------------------------------------------------------
// aplica_a y requerido_en se declaran como STRING[] aquí.
// Sequelize los crea como TEXT[] en la BD.
// Esto se debe a que no maneja un array de enums de manera nativa
//
// Luego dbInit.ts, que corre DESPUÉS del sync, crea el ENUM
// contexto_archivo y convierte ambas columnas:
//   ALTER TABLE tipos_archivo
//     ALTER COLUMN aplica_a TYPE contexto_archivo[]
//     USING aplica_a::contexto_archivo[];
//
// Resultado: la BD tiene validación fuerte de ENUM,
// Sequelize no necesita saber que el tipo cambió.
// ----------------------------------------------------------

export type ContextoArchivo =
  | "estudiante"
  | "profesor"
  | "administrativo"
  | "acudiente"
  | "matricula"

interface TipoArchivoAttributes {
  tipo_archivo_id:         number
  nombre:                  string
  descripcion?:            string
  extensiones_permitidas?: string[]
  activo:                  boolean
  aplica_a?:               string[]   // TEXT[]  convertido a contexto_archivo[] por dbInit
  requerido_en?:           string[]   // TEXT[]  convertido a contexto_archivo[] por dbInit
}

export interface TipoArchivoCreationAttributes
  extends Optional<
    TipoArchivoAttributes,
    | "tipo_archivo_id"
    | "descripcion"
    | "extensiones_permitidas"
    | "activo"
    | "aplica_a"
    | "requerido_en"
  > {}

export class TipoArchivo
  extends Model<TipoArchivoAttributes, TipoArchivoCreationAttributes>
  implements TipoArchivoAttributes
{
  public tipo_archivo_id!:         number
  public nombre!:                  string
  public descripcion?:             string
  public extensiones_permitidas?:  string[]
  public activo!:                  boolean
  public aplica_a?:                string[]
  public requerido_en?:            string[]
}

TipoArchivo.init(
  {
    tipo_archivo_id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },
    nombre: {
      type:      DataTypes.STRING(100),
      allowNull: false,
      unique:    true,
      validate:  { notEmpty: true },
    },
    descripcion: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    extensiones_permitidas: {
      type:      DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      comment:   "Ej: ['.pdf', '.jpg', '.png']",
    },
    activo: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: true,
    },
    aplica_a: {
      type:      DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      comment:   "TEXT[] en Sequelize — dbInit lo convierte a contexto_archivo[]",
    },
    requerido_en: {
      type:      DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      comment:   "Subconjunto de aplica_a — dbInit lo convierte a contexto_archivo[]",
    },
  },
  {
    sequelize,
    tableName:  "tipos_archivo",
    timestamps: false,
    validate: {
      // Validación en modelo: requerido_en debe ser subconjunto de aplica_a
      requeridoEnEsSubconjunto() {
        if (!this.requerido_en || !this.aplica_a) return

        const aplicaASet = new Set(this.aplica_a as string[])
        const invalidos  = (this.requerido_en as string[])
          .filter(ctx => !aplicaASet.has(ctx))

        if (invalidos.length > 0) {
          throw new Error(
            `requerido_en contiene contextos que no están en aplica_a: ${invalidos.join(", ")}`
          )
        }
      },
    },
  }
)