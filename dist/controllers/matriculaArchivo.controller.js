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
exports.MatriculaArchivoController = void 0;
const MatriculaArchivoRepository_1 = require("../models/Repository/MatriculaArchivoRepository");
const MatriculaRepository_1 = require("../models/Repository/MatriculaRepository");
const ArchivoRepository_1 = require("../models/Repository/ArchivoRepository");
const AppError_1 = require("../utils/AppError");
const asyncHandler_1 = require("../utils/asyncHandler");
const express_validator_1 = require("express-validator");
class MatriculaArchivoController {
    constructor() {
        // ----------------------------------------------------------
        // getByMatricula — todos los archivos asociados a una matrícula
        // con info del tipo de archivo para mostrar el checklist
        // ----------------------------------------------------------
        this.getByMatricula = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const matriculaId = Number(req.params.matriculaId);
            const matricula = yield MatriculaRepository_1.MatriculaRepository.findById(matriculaId);
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            const archivos = yield MatriculaArchivoRepository_1.MatriculaArchivoRepository.findByMatricula(matriculaId);
            res.status(200).json({ success: true, data: archivos });
        }));
        // ----------------------------------------------------------
        // getArchivosRequeridos — checklist de documentos obligatorios
        // Responde: { entregado: true/false } por cada tipo requerido.
        // El frontend usa esto para saber qué falta por subir.
        // ----------------------------------------------------------
        this.getArchivosRequeridos = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const matriculaId = Number(req.params.matriculaId);
            const matricula = yield MatriculaRepository_1.MatriculaRepository.findById(matriculaId);
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            const checklist = yield MatriculaArchivoRepository_1.MatriculaArchivoRepository.findArchivosRequeridos(matriculaId);
            const faltantes = checklist.filter((item) => !item.entregado);
            res.status(200).json({
                success: true,
                completo: faltantes.length === 0,
                faltantes: faltantes.length,
                data: checklist,
            });
        }));
        // ----------------------------------------------------------
        // asociar — vincula un archivo existente a una matrícula.
        //
        // El archivo ya debe existir en la tabla `archivos` (fue subido
        // previamente o en el mismo request por el endpoint de archivos).
        // Validaciones:
        //   1. La matrícula existe
        //   2. El archivo existe y pertenece al estudiante de esa matrícula
        // ----------------------------------------------------------
        this.asociar = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty())
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            const matriculaId = Number(req.params.matriculaId);
            const archivo_id = Number(req.params.archivoId);
            const matricula = yield MatriculaRepository_1.MatriculaRepository.findById(matriculaId);
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(Number(archivo_id));
            if (!archivo)
                throw new AppError_1.AppError("Archivo no encontrado", 404);
            // El archivo debe pertenecer al estudiante de la matrícula
            // Esto evita que alguien asocie documentos de otra persona
            if (archivo.persona_id !== matricula.persona_id) {
                throw new AppError_1.AppError("El archivo no pertenece al estudiante de esta matrícula", 403);
            }
            const asociacion = yield MatriculaArchivoRepository_1.MatriculaArchivoRepository.asociar({
                matricula_id: matriculaId,
                archivo_id: Number(archivo_id),
            });
            // Si ON CONFLICT DO NOTHING no insertó nada, ya estaba asociado
            if (!asociacion) {
                return res.status(200).json({
                    success: true,
                    message: "El archivo ya estaba asociado a esta matrícula",
                });
            }
            res.status(201).json({
                success: true,
                message: "Archivo asociado a la matrícula exitosamente",
                data: asociacion,
            });
        }));
        // ----------------------------------------------------------
        // asociarBulk — asocia varios archivos a la vez.
        // Útil cuando el estudiante sube todos los documentos juntos.
        // ----------------------------------------------------------
        this.asociarBulk = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty())
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            const matriculaId = Number(req.params.matriculaId);
            const { archivo_ids } = req.body;
            const matricula = yield MatriculaRepository_1.MatriculaRepository.findById(matriculaId);
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            // Verificar que todos los archivos existen y pertenecen al estudiante
            for (const archivoId of archivo_ids) {
                const archivo = yield ArchivoRepository_1.ArchivoRepository.findById(archivoId);
                if (!archivo) {
                    throw new AppError_1.AppError(`Archivo con ID ${archivoId} no encontrado`, 404);
                }
                if (archivo.persona_id !== matricula.persona_id) {
                    throw new AppError_1.AppError(`El archivo ${archivoId} no pertenece al estudiante de esta matrícula`, 403);
                }
            }
            const asociaciones = yield MatriculaArchivoRepository_1.MatriculaArchivoRepository.asociarBulk(matriculaId, archivo_ids);
            res.status(201).json({
                success: true,
                message: `${asociaciones.length} archivo(s) asociado(s) a la matrícula`,
                data: asociaciones,
            });
        }));
        // ----------------------------------------------------------
        // desasociar — quita el vínculo entre un archivo y la matrícula.
        // El archivo físico NO se elimina.
        // ----------------------------------------------------------
        this.desasociar = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const matriculaId = Number(req.params.matriculaId);
            const archivoId = Number(req.params.archivoId);
            const resultado = yield MatriculaArchivoRepository_1.MatriculaArchivoRepository.desasociar(matriculaId, archivoId);
            if (!resultado) {
                throw new AppError_1.AppError("La asociación no existe", 404);
            }
            res.status(200).json({
                success: true,
                message: "Archivo desasociado de la matrícula exitosamente",
            });
        }));
    }
}
exports.MatriculaArchivoController = MatriculaArchivoController;
//# sourceMappingURL=matriculaArchivo.controller.js.map