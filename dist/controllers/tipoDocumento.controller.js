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
exports.TipoDocumentoController = void 0;
const TipoDocumentoRepository_1 = require("../models/Repository/TipoDocumentoRepository");
const AppError_1 = require("../utils/AppError");
const asyncHandler_1 = require("../utils/asyncHandler");
class TipoDocumentoController {
    constructor() {
        this.getAll = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const tiposDocumento = yield TipoDocumentoRepository_1.TipoDocumentoRepository.findAll();
            res.status(200).json({
                success: true,
                data: tiposDocumento,
            });
        }));
        this.getById = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const tipoDocumento = yield TipoDocumentoRepository_1.TipoDocumentoRepository.findById(id);
            if (!tipoDocumento) {
                throw new AppError_1.AppError("Tipo de documento no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                data: tipoDocumento,
            });
        }));
        this.create = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { tipo_documento: TipoDocumentoData } = req.body;
            const existingTipoDocumento = yield TipoDocumentoRepository_1.TipoDocumentoRepository.findByName(TipoDocumentoData.tipo_documento);
            if (existingTipoDocumento) {
                throw new AppError_1.AppError("Ya existe un tipo documento con este nombre", 404);
            }
            const tipoDocumento = yield TipoDocumentoRepository_1.TipoDocumentoRepository.create(TipoDocumentoData);
            res.status(201).json({
                success: true,
                message: "Tipo de documento creado exitosamente",
                data: tipoDocumento,
            });
        }));
        this.update = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const { tipo_documento: TipoDocumentoData } = req.body;
            const tipoDocumento = yield TipoDocumentoRepository_1.TipoDocumentoRepository.update(id, TipoDocumentoData);
            if (!tipoDocumento) {
                throw new AppError_1.AppError("Tipo de documento no encontrado o sin cambios", 404);
            }
            res.status(200).json({
                success: true,
                message: "Tipo de documento actualizado exitosamente",
                data: tipoDocumento,
            });
        }));
        this.delete = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const tipoDocumento = yield TipoDocumentoRepository_1.TipoDocumentoRepository.delete(id);
            if (!tipoDocumento) {
                throw new AppError_1.AppError("Tipo de documento no encontrado", 404);
            }
            res.status(200).json({
                success: true,
                message: "Tipo de documento eliminado exitosamente",
            });
        }));
    }
}
exports.TipoDocumentoController = TipoDocumentoController;
//# sourceMappingURL=tipoDocumento.controller.js.map