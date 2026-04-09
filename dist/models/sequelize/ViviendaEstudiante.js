"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViviendaEstudiante = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class ViviendaEstudiante extends sequelize_1.Model {
}
exports.ViviendaEstudiante = ViviendaEstudiante;
ViviendaEstudiante.init({
    vivienda_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    estudiante_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true, // 1:1 — un estudiante, una vivienda
        references: {
            model: "estudiantes",
            key: "estudiante_id",
        },
    },
    tipo_paredes: {
        type: sequelize_1.DataTypes.STRING(80),
        allowNull: true,
    },
    tipo_techo: {
        type: sequelize_1.DataTypes.STRING(80),
        allowNull: true,
    },
    tipo_pisos: {
        type: sequelize_1.DataTypes.STRING(80),
        allowNull: true,
    },
    num_banos: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: true,
        validate: { min: 0 },
    },
    num_cuartos: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: true,
        validate: { min: 0 },
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP"),
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "vivienda_estudiante",
    timestamps: false,
});
//# sourceMappingURL=ViviendaEstudiante.js.map