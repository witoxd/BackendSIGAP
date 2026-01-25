"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auditoria = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Auditoria extends sequelize_1.Model {
}
exports.Auditoria = Auditoria;
Auditoria.init({
    auditoria_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tabla_nombre: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    accion: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    usuario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "usuario_id",
        },
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.Sequelize.literal("CURRENT_TIMESTAMP")
    },
    detalle: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "auditoria",
    timestamps: false,
});
//# sourceMappingURL=Auditoria.js.map