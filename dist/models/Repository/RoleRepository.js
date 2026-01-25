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
exports.RoleRepository = void 0;
const database_1 = require("../../config/database");
class RoleRepository {
    static findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM roles ORDER BY role_id");
            return result.rows;
        });
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM roles WHERE role_id = $1", [id]);
            return result.rows[0];
        });
    }
    static findByName(nombre) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT * FROM roles WHERE nombre = $1", [nombre]);
            return result.rows[0];
        });
    }
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("INSERT INTO roles (nombre, descripcion) VALUES ($1, $2) RETURNING *", [
                data.nombre,
                data.descripcion,
            ]);
            return result.rows[0];
        });
    }
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "role_id" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE roles SET ${fields.join(", ")} WHERE role_id = $${paramCount} RETURNING *`, values);
            return result.rows[0];
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("DELETE FROM roles WHERE role_id = $1 RETURNING *", [id]);
            return result.rows[0];
        });
    }
}
exports.RoleRepository = RoleRepository;
//# sourceMappingURL=RoleRepository.js.map