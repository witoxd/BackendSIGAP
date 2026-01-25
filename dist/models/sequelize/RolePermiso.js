"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermiso = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class RolePermiso extends sequelize_1.Model {
}
exports.RolePermiso = RolePermiso;
RolePermiso.init({
    role_permiso_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "roles",
            key: "role_id",
        },
    },
    permiso_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "permisos",
            key: "permiso_id",
        },
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "role_permisos",
    timestamps: false,
});
//# sourceMappingURL=RolePermiso.js.map