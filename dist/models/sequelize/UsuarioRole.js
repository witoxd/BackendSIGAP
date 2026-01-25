"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRole = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class UsuarioRole extends sequelize_1.Model {
}
exports.UsuarioRole = UsuarioRole;
UsuarioRole.init({
    usuario_role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuarios",
            key: "usuario_id",
        },
    },
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "roles",
            key: "role_id",
        },
    },
    fecha_asignacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.Sequelize.literal("CURRENT_TIMESTAMP")
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "usuarios_role",
    timestamps: false,
});
//# sourceMappingURL=UsuarioRole.js.map