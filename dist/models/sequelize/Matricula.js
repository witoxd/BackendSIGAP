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
    jornada_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "jornadas",
            key: "jornada_id",
        },
    },
    periodo_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "periodos_matricula",
            key: "periodo_id",
        },
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
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP"),
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("activa", "finalizada", "retirada"),
        allowNull: false,
        defaultValue: "activa",
    },
    // --- Retiro ---
    fecha_retiro: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
        comment: "Fecha en que el estudiante se retiró en este año escolar específico",
    },
    motivo_retiro: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: true,
    },
    // --- Firmas (futuro) ---
    url_firma_alumno: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        comment: "TODO: ruta de imagen de firma del alumno — implementar cuando se requiera",
    },
    url_firma_acudiente: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        comment: "TODO: ruta de imagen de firma del acudiente — implementar cuando se requiera",
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