"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contacto = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Contacto extends sequelize_1.Model {
}
exports.Contacto = Contacto;
Contacto.init({
    contacto_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    persona_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "personas",
            key: "persona_id",
        },
    },
    tipo_contacto: {
        type: sequelize_1.DataTypes.ENUM("telefono", "celular", "email", "direccion", "otro"),
        allowNull: false,
    },
    valor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    es_principal: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "contactos",
    timestamps: false,
});
//# sourceMappingURL=Contacto.js.map