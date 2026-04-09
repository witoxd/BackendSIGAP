"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FichaEstudiante = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class FichaEstudiante extends sequelize_1.Model {
}
exports.FichaEstudiante = FichaEstudiante;
FichaEstudiante.init({
    ficha_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    estudiante_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true, // 1:1 — un estudiante, una ficha
        references: {
            model: "estudiantes",
            key: "estudiante_id",
        },
    },
    // Contexto escolar
    motivo_traslado: {
        type: sequelize_1.DataTypes.STRING(300),
        allowNull: true,
    },
    limitaciones_fisicas: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    otras_limitaciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    talentos_especiales: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    otras_actividades: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    // Contexto familiar
    numero_hermanos: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: true,
        validate: { min: 0 },
    },
    posicion_hermanos: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: true,
        validate: { min: 1 },
        comment: "Posición entre los hermanos — 1 es el mayor",
    },
    nombre_hermano_mayor: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: true,
    },
    parientes_hogar: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: "Descripción libre de parientes que conviven: abuela, tío, etc.",
    },
    total_parientes: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: true,
        validate: { min: 0 },
    },
    // Datos médicos
    eps_ars: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    alergia: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    centro_atencion_medica: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: true,
    },
    // Transporte
    medio_transporte: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    transporte_propio: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    // Observaciones
    observaciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    // Metadatos
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP")
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP")
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "ficha_estudiante",
    timestamps: false, // Manejamos manualmente con created_at / updated_at
});
//# sourceMappingURL=FichaEstudiante.js.map