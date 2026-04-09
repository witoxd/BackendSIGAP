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
exports.PeriodoMatriculaController = void 0;
const PeriodoMatriculaRepository_1 = require("../models/Repository/PeriodoMatriculaRepository");
const AppError_1 = require("../utils/AppError");
const asyncHandler_1 = require("../utils/asyncHandler");
const express_validator_1 = require("express-validator");
class PeriodoMatriculaController {
    constructor() {
        // ----------------------------------------------------------
        // getAll — lista todos los períodos ordenados por año desc
        // ----------------------------------------------------------
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const periodos = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findAll();
            res.status(200).json({
                success: true,
                data: periodos,
            });
        }));
        // ----------------------------------------------------------
        // getActivo — devuelve el período activo actual.
        // El frontend lo usa para saber si el proceso está abierto
        // y mostrar el formulario de matrícula o un mensaje de cierre.
        // ----------------------------------------------------------
        this.getActivo = (0, asyncHandler_1.asyncHandler)((_req, res) => __awaiter(this, void 0, void 0, function* () {
            const periodo = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findActivo();
            res.status(200).json({
                success: true,
                data: periodo !== null && periodo !== void 0 ? periodo : null,
                abierto: periodo !== null,
            });
        }));
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const periodo = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findById(id);
            if (!periodo)
                throw new AppError_1.AppError("Período de matrícula no encontrado", 404);
            res.status(200).json({ success: true, data: periodo });
        }));
        // ----------------------------------------------------------
        // create — crea un período nuevo (siempre inactivo al inicio).
        //
        // Validaciones:
        //   1. No puede solaparse con un período activo en las mismas fechas
        //   2. fecha_fin debe ser >= fecha_inicio (también en BD con CHECK)
        //   3. Solo un período activo a la vez (garantizado por índice parcial)
        // ----------------------------------------------------------
        this.create = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty())
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            const { periodo: PeriodoData } = req.body;
            const userId = req.user.userId;
            // Validar que fecha_fin >= fecha_inicio
            if (new Date(PeriodoData.fecha_fin) < new Date(PeriodoData.fecha_inicio)) {
                throw new AppError_1.AppError("La fecha de fin no puede ser anterior a la fecha de inicio", 400);
            }
            const periodo = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.create(Object.assign(Object.assign({}, PeriodoData), { activo: false, created_by: userId }));
            res.status(201).json({
                success: true,
                message: "Período de matrícula creado exitosamente",
                data: periodo,
            });
        }));
        // ----------------------------------------------------------
        // activar — habilita el proceso de matrícula.
        //
        // Validaciones antes de activar:
        //   1. El período existe
        //   2. No hay matrículas activas en otro período (el índice
        //      parcial lo garantiza en BD, pero damos mensaje claro)
        //   3. Las fechas del período son válidas respecto a hoy
        // ----------------------------------------------------------
        this.activar = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = Number(req.params.id);
            const periodo = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findById(id);
            if (!periodo)
                throw new AppError_1.AppError("Período de matrícula no encontrado", 404);
            if (periodo.activo) {
                throw new AppError_1.AppError("Este período ya está activo", 409);
            }
            // Verificar que las fechas sean válidas respecto a hoy
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaFin = new Date(periodo.fecha_fin);
            if (fechaFin < hoy) {
                throw new AppError_1.AppError("No se puede activar un período cuya fecha de fin ya pasó. Actualiza las fechas primero.", 400);
            }
            // Verificar si ya hay un período activo — dar mensaje amigable
            // antes de que el índice parcial lance un error crudo de BD
            const periodoActivoActual = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findActivo();
            if (periodoActivoActual) {
                throw new AppError_1.AppError(`Ya existe un período activo (${periodoActivoActual.anio} - ${(_a = periodoActivoActual.descripcion) !== null && _a !== void 0 ? _a : "sin descripción"}). Desactívalo primero.`, 409);
            }
            const periodoActualizado = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.activar(id);
            res.status(200).json({
                success: true,
                message: "Período de matrícula activado. El proceso de matrícula está abierto.",
                data: periodoActualizado,
            });
        }));
        // ----------------------------------------------------------
        // desactivar — cierra el proceso de matrícula manualmente.
        //
        // Las matrículas ya creadas NO se ven afectadas —
        // solo se impide crear nuevas.
        // ----------------------------------------------------------
        this.desactivar = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const periodo = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findById(id);
            if (!periodo)
                throw new AppError_1.AppError("Período de matrícula no encontrado", 404);
            if (!periodo.activo) {
                throw new AppError_1.AppError("Este período ya está inactivo", 409);
            }
            const periodoActualizado = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.desactivar(id);
            res.status(200).json({
                success: true,
                message: "Período de matrícula desactivado. No se aceptan nuevas matrículas.",
                data: periodoActualizado,
            });
        }));
        // ----------------------------------------------------------
        // update — actualiza datos del período (no el campo activo).
        // Para cambiar activo usar activar/desactivar.
        // ----------------------------------------------------------
        this.update = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty())
                throw new AppError_1.AppError("Errores de validación", 400, errors.array());
            const id = Number(req.params.id);
            const { periodo: PeriodoData } = req.body;
            const existente = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findById(id);
            if (!existente)
                throw new AppError_1.AppError("Período de matrícula no encontrado", 404);
            // No permitir cambiar fechas de un período activo con matrículas
            const tieneFechas = PeriodoData.fecha_inicio || PeriodoData.fecha_fin;
            if (tieneFechas && existente.activo) {
                const tieneMatriculas = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.tieneMatriculas(id);
                if (tieneMatriculas) {
                    throw new AppError_1.AppError("No se pueden modificar las fechas de un período activo con matrículas registradas", 409);
                }
            }
            // Validar fechas si ambas llegan en el update
            const fechaInicio = (_a = PeriodoData.fecha_inicio) !== null && _a !== void 0 ? _a : existente.fecha_inicio;
            const fechaFin = (_b = PeriodoData.fecha_fin) !== null && _b !== void 0 ? _b : existente.fecha_fin;
            if (new Date(fechaFin) < new Date(fechaInicio)) {
                throw new AppError_1.AppError("La fecha de fin no puede ser anterior a la fecha de inicio", 400);
            }
            const actualizado = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.update(id, PeriodoData);
            res.status(200).json({
                success: true,
                message: "Período de matrícula actualizado exitosamente",
                data: actualizado,
            });
        }));
        // ----------------------------------------------------------
        // delete — solo si no tiene matrículas asociadas
        // ----------------------------------------------------------
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const periodo = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findById(id);
            if (!periodo)
                throw new AppError_1.AppError("Período de matrícula no encontrado", 404);
            if (periodo.activo) {
                throw new AppError_1.AppError("No se puede eliminar un período activo. Desactívalo primero.", 409);
            }
            const tieneMatriculas = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.tieneMatriculas(id);
            if (tieneMatriculas) {
                throw new AppError_1.AppError("No se puede eliminar un período con matrículas registradas", 409);
            }
            yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.delete(id);
            res.status(200).json({
                success: true,
                message: "Período de matrícula eliminado exitosamente",
            });
        }));
        // ----------------------------------------------------------
        // verificarVigencia — consulta si el período activo sigue
        // dentro de sus fechas. Si venció, lo desactiva automáticamente.
        //
        // Se puede llamar desde un cron job o desde el endpoint
        // GET /periodos-matricula/vigencia antes de mostrar el formulario.
        // ----------------------------------------------------------
        this.verificarVigencia = (0, asyncHandler_1.asyncHandler)((_req, res) => __awaiter(this, void 0, void 0, function* () {
            const periodo = yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.findActivo();
            if (!periodo) {
                return res.status(200).json({
                    success: true,
                    abierto: false,
                    mensaje: "No hay período de matrícula activo",
                });
            }
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaFin = new Date(periodo.fecha_fin);
            if (fechaFin < hoy) {
                // El período venció — desactivar automáticamente
                yield PeriodoMatriculaRepository_1.PeriodoMatriculaRepository.desactivar(periodo.periodo_id);
                return res.status(200).json({
                    success: true,
                    abierto: false,
                    mensaje: `El período de matrícula ${periodo.anio} venció el ${periodo.fecha_fin}. Fue desactivado automáticamente.`,
                    periodo,
                });
            }
            // Calcular días restantes para informar al frontend
            const msRestantes = fechaFin.getTime() - hoy.getTime();
            const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
            res.status(200).json({
                success: true,
                abierto: true,
                dias_restantes: diasRestantes,
                mensaje: `El proceso de matrícula está abierto. Quedan ${diasRestantes} día(s).`,
                periodo,
            });
        }));
    }
}
exports.PeriodoMatriculaController = PeriodoMatriculaController;
//# sourceMappingURL=periodoMatricula.controller.js.map