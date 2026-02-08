"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Estudiante = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Estudiante extends sequelize_1.Model {
}
exports.Estudiante = Estudiante;
Estudiante.init({
    estudiante_id: {
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
    estado: {
        type: sequelize_1.DataTypes.ENUM("activo", "inactivo", "graduado", "suspendido", "expulsado"),
        allowNull: false,
        defaultValue: "activo",
    },
    fecha_ingreso: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP")
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "estudiantes",
    timestamps: false,
});
//# sourceMappingURL=Estudiante.js.map