"use strict";
// ============================================================================
// PATCH para src/controllers/matricula.controller.ts
//
// Reemplaza el método PreocessMatricula (typo incluido) por ProcessMatricula.
// Añade también el método retirar que faltaba para usar MatriculaRepository.retirar()
// ============================================================================
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
exports.MatriculaController = void 0;
const MatriculaRepository_1 = require("../models/Repository/MatriculaRepository");
const AppError_1 = require("../utils/AppError");
const express_validator_1 = require("express-validator");
const PeriodoMatriculaRepository_1 = require("../models/Repository/PeriodoMatriculaRepository");
const asyncHandler_1 = require("../utils/asyncHandler");
const TipoArchivoRepository_1 = require("../models/Repository/TipoArchivoRepository");
const archivos_services_1 = require("../services/archivos.services");
const EstudianteRepository_1 = require("../models/Repository/EstudianteRepository");
const MatriculaArchivoRepository_1 = require("../models/Repository/MatriculaArchivoRepository");
const database_1 = require("../config/database");
class MatriculaController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const limit = Number.parseInt(req.query.limit) || 50;
            const offset = Number.parseInt(req.query.offset) || 0;
            const matriculas = yield MatriculaRepository_1.MatriculaRepository.findAll(limit, offset);
            const total = yield MatriculaRepository_1.MatriculaRepository.count();
            res.status(200).json({
                success: true,
                data: matriculas,
                pagination: { total, limit, offset, pages: Math.ceil(total / limit) },
            });
        }));
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const matricula = yield MatriculaRepository_1.MatriculaRepository.findById(Number(id));
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            res.status(200).json({ success: true, data: matricula });
        }));
        this.getByEstudiante = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const estudiante_id = Number(req.params.estudianteId);
            const matriculas = yield MatriculaRepository_1.MatriculaRepository.findByEstudiante(estudiante_id);
            res.status(200).json({ success: true, data: matriculas });
        }));
        this.getByCurso = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const curso_id = Number(req.params.cursoId);
            const matriculas = yield MatriculaRepository_1.MatriculaRepository.findByCurso(curso_id);
            res.status(200).json({ success: true, data: matriculas });
        }));
        this.create = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty())
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            const { matricula: matriculaData } = req.body;
            const periodoActivo = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findActivo();
            if (!periodoActivo)
                throw new AppError_1.AppError("No hay período de matrícula activo", 400);
            const existente = yield MatriculaRepository_1.MatriculaRepository.findByEstudianteAndPeriodo(matriculaData.estudiante_id, periodoActivo.periodo_id);
            if (existente)
                throw new AppError_1.AppError("El estudiante ya tiene matrícula en el período activo", 409);
            const matricula = yield MatriculaRepository_1.MatriculaRepository.create(Object.assign(Object.assign({}, matriculaData), { periodo_id: periodoActivo.periodo_id }));
            res.status(201).json({ success: true, data: matricula, message: "Matrícula creada exitosamente" });
        }));
        // --------------------------------------------------------------------------
        // ProcessMatricula — flujo completo de matrícula con archivos
        //
        // Hace todo en una sola petición:
        //   1. Valida que el estudiante exista
        //   2. Resuelve el período activo automáticamente
        //   3. Crea la matrícula (o reutiliza la existente si ya fue creada)
        //   4. Valida y guarda los archivos físicos (multer ya los subió)
        //   5. Persiste los registros en `archivos`
        //   6. Asocia cada archivo a la matrícula en `matricula_archivos`
        //   7. En caso de error en cualquier paso: elimina los archivos físicos del disco
        //
        // Analogía: es como registrarse en un hotel. No basta con llegar (matrícula),
        // también hay que entregar los documentos (archivos) y que el recepcionista
        // los adjunte a tu reserva (asociación). Si algo falla en el medio, no quedas
        // "a medias registrado" — todo se revierte.
        //
        // Formato del request (multipart/form-data):
        //   - archivos:    File[]  — los archivos físicos
        //   - persona_id:  number  — persona del estudiante
        //   - curso_id:    number  — curso al que se matricula
        //   - jornada_id:  number  — jornada
        //   - metadata:    JSON string — [{ tipo_archivo_id: 1, descripcion: "..." }, ...]
        //                  Un objeto por cada archivo, en el mismo orden
        // --------------------------------------------------------------------------
        this.ProcessMatricula = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                // Multer ya guardó los archivos físicos antes de llegar aquí.
                // Si la validación falla, hay que limpiarlos del disco.
                if (req.files)
                    yield archivos_services_1.archivoService.deleteFileArray(req.files);
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            }
            const userId = req.user.userId;
            const files = req.files;
            if (!files || files.length === 0) {
                throw new AppError_1.AppError("Se requiere al menos un archivo", 400);
            }
            const { persona_id, curso_id, jornada_id, metadata } = req.body;
            // ------------------------------------------------------------------
            // Paso 1: Verificar que el estudiante existe por persona_id
            // ------------------------------------------------------------------
            const estudiante = yield EstudianteRepository_1.EstudianteRepository.findByPersonaId(Number(persona_id));
            if (!estudiante) {
                yield archivos_services_1.archivoService.deleteFileArray(files);
                throw new AppError_1.AppError("No se encontró un estudiante asociado a esa persona", 404);
            }
            if (!curso_id || !jornada_id) {
                yield archivos_services_1.archivoService.deleteFileArray(files);
                throw new AppError_1.AppError("Se requieren curso_id y jornada_id para crear la matrícula", 400);
            }
            // ------------------------------------------------------------------
            // Paso 2: Parsear metadata
            // La metadata viene como JSON string desde FormData porque multipart
            // no puede enviar objetos anidados directamente.
            // ------------------------------------------------------------------
            const metadataArray = archivos_services_1.archivoService.normalizeMetadata(metadata);
            if (metadataArray.length !== files.length) {
                yield archivos_services_1.archivoService.deleteFileArray(files);
                throw new AppError_1.AppError(`La cantidad de metadata (${metadataArray.length}) no coincide con la cantidad de archivos (${files.length})`, 400);
            }
            // ------------------------------------------------------------------
            // Paso 3: Obtener tipos de archivo requeridos para el contexto matrícula
            // Esto nos da la lista de tipos VÁLIDOS para una matrícula.
            // Se hace fuera de la transacción porque es solo lectura y es costoso
            // repetirlo por cada archivo.
            // ------------------------------------------------------------------
            const tiposRequeridosEnMatricula = yield TipoArchivoRepository_1.TipoArchivoRepository.findByContexto("matricula");
            if (tiposRequeridosEnMatricula.length === 0) {
                yield archivos_services_1.archivoService.deleteFileArray(files);
                throw new AppError_1.AppError("No hay tipos de archivo configurados para el contexto de matrícula", 500);
            }
            const tiposPermitidosIds = new Set(tiposRequeridosEnMatricula.map((t) => t.tipo_archivo_id));
            // ------------------------------------------------------------------
            // Paso 4: Validar cada archivo antes de tocar la BD.
            // Fallar rápido: verificamos todo antes de iniciar la transacción.
            // Si algo está mal, limpiamos el disco y lanzamos error.
            // ------------------------------------------------------------------
            for (let i = 0; i < files.length; i++) {
                const meta = metadataArray[i];
                if (!meta || meta.tipo_archivo_id === undefined || meta.tipo_archivo_id === null) {
                    yield archivos_services_1.archivoService.deleteFileArray(files);
                    throw new AppError_1.AppError("Cada archivo debe incluir tipo_archivo_id en la metadata", 400);
                }
                const tipoArchivo = yield TipoArchivoRepository_1.TipoArchivoRepository.findById(Number(meta.tipo_archivo_id));
                if (!tipoArchivo) {
                    yield archivos_services_1.archivoService.deleteFileArray(files);
                    throw new AppError_1.AppError(`Tipo de archivo con ID ${meta.tipo_archivo_id} no encontrado`, 404);
                }
                // El tipo de archivo debe estar permitido en el contexto matrícula.
                // Analogía: no puedes entregar una hoja de vida para matricularte —
                // solo se aceptan los documentos del contexto matrícula.
                if (!tiposPermitidosIds.has(Number(meta.tipo_archivo_id))) {
                    yield archivos_services_1.archivoService.deleteFileArray(files);
                    throw new AppError_1.AppError(`El tipo de archivo "${tipoArchivo.nombre}" no está permitido para el contexto de matrícula`, 400);
                }
            }
            // ------------------------------------------------------------------
            // Paso 5: Transacción atómica
            //
            // Todo lo que toca la BD se hace aquí. Si cualquier operación falla,
            // PostgreSQL revierte automáticamente con el ROLLBACK del try/catch
            // de nuestra función transaction().
            //
            // IMPORTANTE: los archivos físicos en disco NO son parte de la
            // transacción de BD — si la transacción falla, hay que eliminarlos
            // manualmente en el catch exterior.
            // ------------------------------------------------------------------
            try {
                const resultado = yield (0, database_1.transaction)((client) => __awaiter(this, void 0, void 0, function* () {
                    // 5a. Resolver período activo
                    const periodoActivo = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findActivo();
                    if (!periodoActivo) {
                        throw new AppError_1.AppError("No hay período de matrícula activo", 400);
                    }
                    // 5b. Crear matrícula o reutilizar la existente en este período.
                    // El UNIQUE(estudiante_id, periodo_id) en la BD lo garantiza,
                    // pero damos un mensaje amigable antes de llegar al constraint.
                    let matricula = yield MatriculaRepository_1.MatriculaRepository.findByEstudianteAndPeriodo(estudiante.estudiante.estudiante_id, periodoActivo.periodo_id);
                    if (!matricula) {
                        matricula = yield MatriculaRepository_1.MatriculaRepository.create({
                            estudiante_id: estudiante.estudiante.estudiante_id,
                            curso_id: Number(curso_id),
                            jornada_id: Number(jornada_id),
                            periodo_id: periodoActivo.periodo_id,
                            estado: "vigente",
                        }, client);
                    }
                    // 5c. Guardar registros de archivos en la BD usando el servicio centralizado
                    const archivosGuardados = yield archivos_services_1.archivoService.RegisterFileArray(files, metadataArray, Number(persona_id), userId, client);
                    // 5d. Asociar cada archivo a la matrícula
                    const archivoIds = archivosGuardados.map((a) => a.archivo_id);
                    yield MatriculaArchivoRepository_1.MatriculaArchivoRepository.asociarBulk(matricula.matricula_id, archivoIds, client);
                    return { matricula, archivosGuardados };
                }));
                res.status(201).json({
                    success: true,
                    message: `Matrícula procesada. ${resultado.archivosGuardados.length} archivo(s) asociado(s).`,
                    data: {
                        matricula: resultado.matricula,
                        archivos: resultado.archivosGuardados,
                    },
                });
            }
            catch (error) {
                // Si la transacción de BD falló, eliminamos los archivos físicos
                // que multer ya había guardado en disco. Sin esto quedarían huérfanos.
                yield archivos_services_1.archivoService.deleteFileArray(files);
                throw error;
            }
        }));
        // --------------------------------------------------------------------------
        // retirar — único cambio de estado manual permitido en una matrícula.
        // Los demás estados (activa, finalizada) se derivan de las fechas.
        // --------------------------------------------------------------------------
        this.retirar = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const { motivo } = req.body;
            const matricula = yield MatriculaRepository_1.MatriculaRepository.findById(id);
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            if (matricula.estado_raw === "retirada") {
                throw new AppError_1.AppError("La matrícula ya está en estado retirada", 409);
            }
            const actualizada = yield MatriculaRepository_1.MatriculaRepository.retirar(id, motivo);
            res.status(200).json({
                success: true,
                message: "Estudiante retirado de la matrícula exitosamente",
                data: actualizada,
            });
        }));
        this.update = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty())
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            const id = Number(req.params.id);
            const { matricula: matriculaData } = req.body;
            const matricula = yield MatriculaRepository_1.MatriculaRepository.update(id, matriculaData);
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            res.status(200).json({ success: true, data: matricula, message: "Matrícula actualizada exitosamente" });
        }));
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const matricula = yield MatriculaRepository_1.MatriculaRepository.delete(Number(id));
            if (!matricula)
                throw new AppError_1.AppError("Matrícula no encontrada", 404);
            res.status(200).json({ success: true, data: matricula, message: "Matrícula eliminada exitosamente" });
        }));
    }
}
exports.MatriculaController = MatriculaController;
//# sourceMappingURL=matricula.controller.js.map