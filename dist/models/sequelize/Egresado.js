"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Egresado = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Egresado extends sequelize_1.Model {
}
exports.Egresado = Egresado;
Egresado.init({
    egresado_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    estudiante_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "estudiantes",
            key: "estudiante_id",
        },
    },
    fecha_grado: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "egresados",
    timestamps: false,
});
//# sourceMappingURL=Egresado.js.map