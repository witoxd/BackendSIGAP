import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../../config/database"


// Falta agregar el contacto de familiar

interface ProfesorAttributes {
  profesor_id: number
  persona_id: number
  fecha_contratacion: Date
  fecha_nombramiento?: Date
  numero_resolucion?: string
  estado: "activo" | "inactivo"
  jornada_id?: number
  sede?: string
  titulo?: string
  perfil_profesional?: string
  posgrado?: string
  grado_escalafon?: string
  cargo?: string
  area?: string
  tipo_contrato?: string
}

export interface ProfesorCreationAttributes extends Optional<ProfesorAttributes, "profesor_id" | "estado"> { }

export class Profesor extends Model<ProfesorAttributes, ProfesorCreationAttributes> implements ProfesorAttributes {
  public profesor_id!: number
  public persona_id!: number
  public fecha_contratacion!: Date
  public fecha_nombramiento!: Date
  public numero_resolucion!: string 
  public jornada_id!: number
  public estado!: "activo" | "inactivo"
  public sede!: string
  public titulo?: string
  public perfil_profesional?: string 
  public posgrado?: string
  public grado_escalafon?: string
  public cargo?: string
  public area?: string 
  public tipo_contrato?: string
}

Profesor.init(
  {
    profesor_id: {
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
    fecha_contratacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "activo"
    },
    fecha_nombramiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    numero_resolucion: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "N° de resolución de nombramiento",
    },
    jornada_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "jornadas", key: "jornada_id" },
    },
    sede: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    perfil_profesional: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    posgrado: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    grado_escalafon: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Grado del escalafón docente colombiano, ej: 2, 11, 14",
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Área de enseñanza: Matemáticas, Ciencias, etc.",
    },
    tipo_contrato: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: "Ej: Provisional, En propiedad, OPS",
    }
  },
  {
    sequelize,
    tableName: "profesores",
    timestamps: false,
  },
)
