"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Acudiente = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Acudiente extends sequelize_1.Model {
}
exports.Acudiente = Acudiente;
Acudiente.init({
    acudiente_id: {
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
    parentesco: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "acudientes",
    timestamps: false,
});
//# sourceMappingURL=Acudiente.js.map