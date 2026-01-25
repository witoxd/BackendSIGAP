"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Role extends sequelize_1.Model {
}
exports.Role = Role;
Role.init({
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.ENUM("admin", "profesor", "estudiante", "administrativo"),
        allowNull: false
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "roles",
    timestamps: false,
});
//# sourceMappingURL=Role.js.map