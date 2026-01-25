"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class Usuario extends sequelize_1.Model {
    // Método para verificar contraseña
    verifyPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(password, this.contraseña);
        });
    }
}
exports.Usuario = Usuario;
Usuario.init({
    usuario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    persona_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: "personas",
            key: "persona_id",
        },
    },
    username: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 50],
            isAlphanumeric: true,
        },
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isEmail: true,
        },
    },
    contraseña: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [60, 255], // bcrypt produce hashes de 60 caracteres
        },
    },
    activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    fecha_creacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.Sequelize.literal("CURRENT_TIMESTAMP")
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "usuarios",
    timestamps: false,
    hooks: {
        // Hook para hashear contraseñas antes de crear
        beforeCreate: (usuario) => __awaiter(void 0, void 0, void 0, function* () {
            if (usuario.contraseña) {
                usuario.contraseña = yield bcryptjs_1.default.hash(usuario.contraseña, 10);
            }
        }),
        // Hook para hashear contraseñas antes de actualizar
        beforeUpdate: (usuario) => __awaiter(void 0, void 0, void 0, function* () {
            if (usuario.changed("contraseña")) {
                usuario.contraseña = yield bcryptjs_1.default.hash(usuario.contraseña, 10);
            }
        }),
    },
});
//# sourceMappingURL=Usuario.js.map