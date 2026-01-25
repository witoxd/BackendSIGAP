"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Curso = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Curso extends sequelize_1.Model {
}
exports.Curso = Curso;
Curso.init({
    curso_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        validate: {
            notEmpty: true,
        },
    },
    grado: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: "cursos",
    timestamps: false,
});
//# sourceMappingURL=Curso.js.map