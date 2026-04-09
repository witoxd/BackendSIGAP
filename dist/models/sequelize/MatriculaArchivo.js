"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatriculaArchivo = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class MatriculaArchivo extends sequelize_1.Model {
}
exports.MatriculaArchivo = MatriculaArchivo;
MatriculaArchivo.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    matricula_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "matriculas", key: "matricula_id" },
    },
    archivo_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "archivos", key: "archivo_id" },
    },
    fecha_asociacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP"),
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "matricula_archivos",
    timestamps: false,
    indexes: [
        {
            // Un mismo archivo no puede asociarse dos veces
            // a la misma matrícula
            unique: true,
            fields: ["matricula_id", "archivo_id"],
        },
    ],
});
//# sourceMappingURL=MatriculaArchivo.js.map