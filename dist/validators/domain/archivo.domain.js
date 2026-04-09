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
exports.validateUpdateArchivoDomain = exports.validateCreateArchivoDomain = void 0;
const Archivo_1 = require("../../models/sequelize/Archivo");
const sequelize_1 = require("sequelize");
/**
 * Validador de dominio para creacion de archivo
 * Nota: url_archivo se genera automaticamente desde el archivo subido,
 * por eso se usa un valor temporal para la validacion de Sequelize
 */
const validateCreateArchivoDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // En form-data los campos vienen directamente en body (no anidados)
        const { persona_id, nombre, descripcion, tipo_archivo_id } = req.body;
        // Construir objeto para validacion
        // url_archivo se genera despues de subir el archivo, usamos placeholder
        const archivoData = {
            persona_id: Number(persona_id),
            nombre: nombre || "archivo_temporal",
            descripcion,
            tipo_archivo_id: Number(tipo_archivo_id),
            url_archivo: "/placeholder", // Temporal, se reemplaza con la URL real
            activo: true
        };
        // Validacion dominio con Sequelize (NO DB)
        // Saltamos la validacion de url_archivo porque se genera despues
        yield Archivo_1.Archivos.build(archivoData).validate({
            skip: ["url_archivo"],
        });
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validacion de dominio",
                errors: error.errors.map((e) => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateCreateArchivoDomain = validateCreateArchivoDomain;
/**
 * Validador de dominio para actualizacion de archivo
 */
const validateUpdateArchivoDomain = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, descripcion, tipo_archivo, activo } = req.body;
        // Solo validar campos que vienen en el request
        const archivoData = {};
        if (nombre !== undefined)
            archivoData.nombre = nombre;
        if (descripcion !== undefined)
            archivoData.descripcion = descripcion;
        if (tipo_archivo !== undefined)
            archivoData.tipo_archivo = tipo_archivo;
        if (activo !== undefined) {
            // Convertir string a boolean si viene de form-data
            archivoData.activo = activo === "true" || activo === true;
        }
        // Si no hay campos para validar, continuar
        if (Object.keys(archivoData).length === 0) {
            return next();
        }
        // Validacion dominio con Sequelize (NO DB)
        // Saltamos campos requeridos que no se actualizan
        yield Archivo_1.Archivos.build(archivoData).validate({
            skip: ["persona_id", "url_archivo", "tipo_archivo", "nombre"],
        });
        next();
    }
    catch (error) {
        if (error instanceof sequelize_1.ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Error de validacion de dominio",
                errors: error.errors.map((e) => ({
                    field: e.path,
                    message: e.message,
                })),
            });
        }
        next(error);
    }
});
exports.validateUpdateArchivoDomain = validateUpdateArchivoDomain;
//# sourceMappingURL=archivo.domain.js.map