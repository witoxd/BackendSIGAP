"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Jornada = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Jornada extends sequelize_1.Model {
}
exports.Jornada = Jornada;
Jornada.init({
    jornada_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    hora_inicio: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: true,
    },
    hora_fin: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "jornadas",
    timestamps: false,
});
//# sourceMappingURL=Jornada.js.map