"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matricula = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Matricula extends sequelize_1.Model {
}
exports.Matricula = Matricula;
Matricula.init({
    matricula_id: {
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
    profesor_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "profesores",
            key: "profesor_id"
        }
    },
    curso_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "cursos",
            key: "curso_id",
        },
    },
    fecha_matricula: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP")
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("activa", "finalizada", "retirada"),
        allowNull: false,
        defaultValue: "activa",
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "matriculas",
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["estudiante_id", "curso_id"],
        },
    ],
});
//# sourceMappingURL=Matricula.js.map