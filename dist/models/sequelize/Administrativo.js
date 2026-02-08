"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministrativoInit = exports.Administrativo = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Administrativo extends sequelize_1.Model {
}
exports.Administrativo = Administrativo;
exports.AdministrativoInit = Administrativo.init({
    administrativo_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    persona_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: "personas",
            key: "persona_id",
        },
    },
    cargo: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    fecha_contratacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP"),
    },
    estado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "administrativos",
    timestamps: false,
});
//# sourceMappingURL=Administrativo.js.map