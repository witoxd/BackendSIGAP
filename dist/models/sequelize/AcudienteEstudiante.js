"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcudienteEstudiante = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class AcudienteEstudiante extends sequelize_1.Model {
}
exports.AcudienteEstudiante = AcudienteEstudiante;
AcudienteEstudiante.init({
    acudiente_estudiante_id: {
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
    acudiente_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "acudientes",
            key: "acudiente_id",
        },
    },
    tipo_relacion: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    es_principal: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "acudiente_estudiante",
    timestamps: false,
});
//# sourceMappingURL=AcudienteEstudiante.js.map