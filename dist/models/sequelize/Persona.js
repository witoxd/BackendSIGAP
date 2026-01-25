"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Persona = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Persona extends sequelize_1.Model {
}
exports.Persona = Persona;
Persona.init({
    persona_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombres: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100],
        },
    },
    apellido_paterno: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        validate: {
            notEmpty: false,
            len: [2, 50],
        },
    },
    apellido_materno: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        validate: {
            notEmpty: false,
            len: [2, 50],
        },
    },
    tipo_documento_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "tipo_documento",
            key: "tipo_documento_id",
        }
    },
    numero_documento: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [5, 20],
        },
    },
    fecha_nacimiento: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            isBefore: new Date().toISOString(),
        },
    },
    genero: {
        type: sequelize_1.DataTypes.ENUM("Masculino", "Femenino", "Otro"),
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "personas",
    timestamps: false,
});
//# sourceMappingURL=Persona.js.map