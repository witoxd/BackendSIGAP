"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profesor = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Profesor extends sequelize_1.Model {
}
exports.Profesor = Profesor;
Profesor.init({
    profesor_id: {
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
    fecha_contratacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: database_1.sequelize.literal("CURRENT_TIMESTAMP")
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "activo"
    }
}, {
    sequelize: database_1.sequelize,
    tableName: "profesores",
    timestamps: false,
});
//# sourceMappingURL=Profesor.js.map