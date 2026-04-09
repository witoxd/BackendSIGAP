"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Archivos = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Archivos extends sequelize_1.Model {
}
exports.Archivos = Archivos;
Archivos.init({
    archivo_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    persona_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "personas",
            key: "persona_id",
        },
    },
    tipo_archivo_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "tipos_archivo",
            key: "tipo_archivo_id",
        },
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    url_archivo: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    fecha_carga: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP"),
    },
    asignado_por: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "usuario_id",
        },
    },
    activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "archivos",
    timestamps: false,
});
//# sourceMappingURL=Archivo.js.map