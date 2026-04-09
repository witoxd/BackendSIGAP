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
exports.ContactoRepository = void 0;
const database_1 = require("../../config/database");
class ContactoRepository {
    /**
     * Obtener todos los contactos con paginación
     */
    static findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 50, offset = 0) {
            const result = yield (0, database_1.query)(`SELECT 
      contacto_id,
      persona_id,
      tipo_contacto,
      valor,
      es_principal
       FROM contactos WHERE activo = true
       ORDER BY es_principal DESC, contacto_id
       LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows;
        });
    }
    /**
     * Buscar contacto por ID
     */
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT 
      contacto_id,
      persona_id,
      tipo_contacto,
      valor,
      es_principal
       FROM contactos c
       WHERE c.contacto_id = $1 AND activo = true`, [id]);
            return result.rows[0];
        });
    }
    /**
     * Obtener todos los contactos de una persona
     */
    static findByPersonaId(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT 
      contacto_id,
      persona_id,
      tipo_contacto,
      valor,
      es_principal
       FROM contactos 
       WHERE persona_id = $1 AND activo = true
       ORDER BY es_principal DESC, contacto_id`, [personaId]);
            return result.rows;
        });
    }
    /**
     * Obtener contactos por tipo
     */
    static findByTipo(personaId, tipoContacto) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT * FROM contactos 
       WHERE persona_id = $1 AND tipo_contacto = $2 AND activo = true
       ORDER BY es_principal DESC`, [personaId, tipoContacto]);
            return result.rows;
        });
    }
    /**
     * Obtener contacto principal de una persona
     */
    static findPrincipalByPersona(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`SELECT * FROM contactos 
       WHERE persona_id = $1 AND es_principal = true AND activo = true
       LIMIT 1`, [personaId]);
            return result.rows[0];
        });
    }
    /**
     * Crear un nuevo contacto
     */
    static create(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const result = yield (0, database_1.query)(`INSERT INTO contactos (persona_id, tipo_contacto, valor, es_principal, activo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
                data.persona_id,
                data.tipo_contacto,
                data.valor,
                (_a = data.es_principal) !== null && _a !== void 0 ? _a : false,
                (_b = data.activo) !== null && _b !== void 0 ? _b : true,
            ], client);
            return result.rows[0];
        });
    }
    /**
     * Crear múltiples contactos
     */
    static bulkCreate(data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.length === 0)
                return [];
            const fields = ["persona_id", "tipo_contacto", "valor", "es_principal", "activo"];
            const values = [];
            const placeholders = [];
            data.forEach((item, index) => {
                var _a, _b;
                const baseIndex = index * fields.length;
                placeholders.push(`(${fields.map((_, i) => `$${baseIndex + i + 1}`).join(", ")})`);
                values.push(item.persona_id, item.tipo_contacto, item.valor, (_a = item.es_principal) !== null && _a !== void 0 ? _a : false, (_b = item.activo) !== null && _b !== void 0 ? _b : true);
            });
            const result = yield (0, database_1.query)(`INSERT INTO contactos (${fields.join(", ")})
       VALUES ${placeholders.join(", ")}
       RETURNING *`, values, client);
            return result.rows;
        });
    }
    /**
     * Actualizar un contacto
     */
    static update(id, data, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "contacto_id" && value !== undefined) {
                    fields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (fields.length === 0)
                return null;
            values.push(id);
            const result = yield (0, database_1.query)(`UPDATE contactos 
       SET ${fields.join(", ")} 
       WHERE contacto_id = $${paramCount} 
       RETURNING *`, values, client);
            return result.rows[0];
        });
    }
    /**
     * Eliminar (soft delete) un contacto
     */
    static delete(id, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`UPDATE contactos SET activo = false 
       WHERE contacto_id = $1 
       RETURNING *`, [id], client);
            return result.rows[0];
        });
    }
    /**
     * Eliminar permanentemente un contacto
     */
    static hardDelete(id, client) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)(`DELETE FROM contactos 
       WHERE contacto_id = $1 
       RETURNING *`, [id], client);
            return result.rows[0];
        });
    }
    /**
     * Contar contactos totales
     */
    static count() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM contactos WHERE activo = true");
            return Number.parseInt(result.rows[0].count);
        });
    }
    /**
     * Contar contactos por persona
     */
    static countByPersona(personaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, database_1.query)("SELECT COUNT(*) FROM contactos WHERE persona_id = $1 AND activo = true", [personaId]);
            return Number.parseInt(result.rows[0].count);
        });
    }
    /**
     * Establecer un contacto como principal y quitar principal de los demás
     */
    static setPrincipal(contactoId, personaId, client) {
        return __awaiter(this, void 0, void 0, function* () {
            // Primero quitar principal de todos los contactos de la persona
            yield (0, database_1.query)(`UPDATE contactos SET es_principal = false 
       WHERE persona_id = $1`, [personaId], client);
            // Luego establecer el nuevo principal
            const result = yield (0, database_1.query)(`UPDATE contactos SET es_principal = true 
       WHERE contacto_id = $1 
       RETURNING *`, [contactoId], client);
            return result.rows[0];
        });
    }
}
exports.ContactoRepository = ContactoRepository;
//# sourceMappingURL=ContactoRepository.js.map