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
exports.PersonaService = void 0;
const Persona_1 = require("../models/sequelize/Persona");
const PersonaRepository_1 = require("../models/Repository/PersonaRepository");
const sequelize_1 = require("sequelize");
const AppError_1 = require("../utils/AppError");
class PersonaService {
    static validateOrCreatePersona(personaData, client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingPersona = yield PersonaRepository_1.PersonaRepository.findByDocumento(personaData.numero_documento);
                if (existingPersona) {
                    return existingPersona;
                }
                yield Persona_1.Persona.build(personaData).validate();
                // 3️⃣ Crear persona
                return yield PersonaRepository_1.PersonaRepository.create(personaData, client);
            }
            catch (error) {
                // 4️⃣ Error de validación de dominio
                if (error instanceof sequelize_1.ValidationError) {
                    throw new AppError_1.AppError("Error de validación de persona", 400, error.errors.map(e => ({
                        field: e.path,
                        message: e.message,
                    })));
                }
                throw error;
            }
        });
    }
}
exports.PersonaService = PersonaService;
//# sourceMappingURL=persona.service.js.map