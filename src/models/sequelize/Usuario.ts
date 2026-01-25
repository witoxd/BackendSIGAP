import { DataTypes, Model, Sequelize, type Optional } from "sequelize"
import { sequelize } from "../../config/database"
import bcrypt from "bcryptjs"

interface UsuarioAttributes {
  usuario_id: number
  persona_id: number
  username: string
  email: string
  contraseña: string
  activo: boolean
  fecha_creacion: Date
}

export interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, "usuario_id" | "activo" | "fecha_creacion"> {}

export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public usuario_id!: number
  public persona_id!: number
  public username!: string
  public email!: string
  public contraseña!: string
  public activo!: boolean
  public fecha_creacion!: Date

  // Método para verificar contraseña
  public async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.contraseña)
  }
}

Usuario.init(
  {
    usuario_id: {
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
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
        isAlphanumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    contraseña: {
      type: DataTypes.STRING(255),
      allowNull: false,
        unique:true,
      validate: {
        notEmpty: true,
        len: [60, 255], // bcrypt produce hashes de 60 caracteres
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
  },
  {
    sequelize,
    tableName: "usuarios",
    timestamps: false,
    hooks: {
      // Hook para hashear contraseñas antes de crear
      beforeCreate: async (usuario: Usuario) => {
        if (usuario.contraseña) {
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, 10)
        }
      },
      // Hook para hashear contraseñas antes de actualizar
      beforeUpdate: async (usuario: Usuario) => {
        if (usuario.changed("contraseña")) {
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, 10)
        }
      },
    },
  },
)
