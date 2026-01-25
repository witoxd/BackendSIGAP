"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoDocumentoRepository = void 0;
const database_1 = require("../../config/database");
class TipoDocumentoRepository {
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM tipo_documento ORDER BY tipo_documento");
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM tipo_documento WHERE tipo_documento_id = $1", [id]);
            return result.rows[0];
        });
    }
    static findByName(tipo_documento) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM tipo_documento WHERE tipo_documento = $1", [tipo_documento]);
            return result.rows[0];
        });
    }
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`INSERT INTO tipo_documento ( tipo_documento, nombre_documento)
       VALUES ($1, $2) RETURNING *`, [data.tipo_documento, data.nombre_documento], client);
            return result.rows[0];
        });
    }
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "tipo_documento_id" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE tipo_documento SET ${fields.join(", ")} WHERE tipo_documento_id = $${paramCount} RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM tipo_documento WHERE tipo_documento_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
}
exports.TipoDocumentoRepository = TipoDocumentoRepository;
//# sourceMappingURL=TipoDocumentoRepository.js.map