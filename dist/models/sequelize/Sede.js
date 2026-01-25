"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sede = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Sede extends sequelize_1.Model {
}
exports.Sede = Sede;
Sede.init({
    sede_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    direccion: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "sedes",
    timestamps: false,
});
//# sourceMappingURL=Sede.js.map