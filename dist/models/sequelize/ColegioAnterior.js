"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColegioAnterior = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class ColegioAnterior extends sequelize_1.Model {
}
exports.ColegioAnterior = ColegioAnterior;
ColegioAnterior.init({
    colegio_ant_id: {
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
    nombre_colegio: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    ciudad: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    grado_cursado: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    anio: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: true,
        validate: {
            min: 1900,
            max: new Date().getFullYear(),
        },
    },
    orden: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "colegios_anteriores",
    timestamps: false,
});
//# sourceMappingURL=ColegioAnterior.js.map