"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoDocumento = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class TipoDocumento extends sequelize_1.Model {
}
exports.TipoDocumento = TipoDocumento;
TipoDocumento.init({
    tipo_documento_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tipo_documento: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    nombre_documento: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false
    }
}, {
    sequelize: database_1.sequelize,
    tableName: "tipo_documento",
    timestamps: false,
});
//# sourceMappingURL=TipoDocumento.js.map