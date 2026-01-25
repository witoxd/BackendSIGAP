"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permiso = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Permiso extends sequelize_1.Model {
}
exports.Permiso = Permiso;
Permiso.init({
    permiso_id: {
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
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    recurso: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    accion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: "permisos",
    timestamps: false,
});
//# sourceMappingURL=Permiso.js.map