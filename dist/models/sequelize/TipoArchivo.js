"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoArchivo = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class TipoArchivo extends sequelize_1.Model {
}
exports.TipoArchivo = TipoArchivo;
TipoArchivo.init({
    tipo_archivo_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    extensiones_permitidas: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: true,
        comment: "Ej: ['.pdf', '.jpg', '.png']",
    },
    activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    aplica_a: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: true,
        comment: "TEXT[] en Sequelize — dbInit lo convierte a contexto_archivo[]",
    },
    requerido_en: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: true,
        comment: "Subconjunto de aplica_a — dbInit lo convierte a contexto_archivo[]",
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "tipos_archivo",
    timestamps: false,
    validate: {
        // Validación en modelo: requerido_en debe ser subconjunto de aplica_a
        requeridoEnEsSubconjunto() {
            if (!this.requerido_en || !this.aplica_a)
                return;
            const aplicaASet = new Set(this.aplica_a);
            const invalidos = this.requerido_en
                .filter(ctx => !aplicaASet.has(ctx));
            if (invalidos.length > 0) {
                throw new Error(`requerido_en contiene contextos que no están en aplica_a: ${invalidos.join(", ")}`);
            }
        },
    },
});
//# sourceMappingURL=TipoArchivo.js.map