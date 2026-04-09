"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodoMatricula = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class PeriodoMatricula extends sequelize_1.Model {
}
exports.PeriodoMatricula = PeriodoMatricula;
PeriodoMatricula.init({
    periodo_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    anio: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: false,
        validate: { min: 2000, max: 2100 },
        comment: "Año escolar al que corresponde este período",
    },
    fecha_inicio: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    fecha_fin: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Solo un período puede estar activo — garantizado por índice parcial UNIQUE WHERE activo = true",
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: true,
    },
    created_by: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: "usuarios", key: "usuario_id" },
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP"),
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "periodos_matricula",
    timestamps: false,
    // El índice parcial se crea en la migración SQL, no aquí,
    // porque Sequelize no soporta índices parciales nativamente:
    //
    //   CREATE UNIQUE INDEX idx_un_periodo_activo
    //   ON periodos_matricula(activo)
    //   WHERE activo = true;
    //
    // Eso garantiza que si intentas activar un segundo período
    // la BD rechaza el INSERT/UPDATE antes de que el código lo vea.
});
//# sourceMappingURL=PeriodoMatricula.js.map