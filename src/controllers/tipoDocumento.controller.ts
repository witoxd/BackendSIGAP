import type { Request, Response, NextFunction } from "express"
import { TipoDocumentoRepository } from "../models/Repository/TipoDocumentoRepository"
import { AppError } from "../utils/AppError"
import { CreateTipoDocumentoDTO, UpdateTipoDocumentoDTO } from "../types"


type CreateTipoDocumentoStaticRequest = Request<never, unknown, CreateTipoDocumentoDTO>

export class TipoDocumentoController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tiposDocumento = await TipoDocumentoRepository.findAll()

      res.status(200).json({
        success: true,
        data: tiposDocumento,
      })
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const tipoDocumento = await TipoDocumentoRepository.findById(id)

      if (!tipoDocumento) {
        throw new AppError("Tipo de documento no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: tipoDocumento,
      })
    } catch (error) {
      next(error)
    }
  }



  async create(req: CreateTipoDocumentoStaticRequest, res: Response, next: NextFunction) {

    const {tipo_documento: TipoDocumentoData} = req.body

    const existingTipoDocumento = await TipoDocumentoRepository.findByName(TipoDocumentoData.tipo_documento)

    if(existingTipoDocumento){
      throw new AppError("Ya existe un tipo documento con este nombre", 404)
    }

    try {
      const tipoDocumento = await TipoDocumentoRepository.create(TipoDocumentoData)

      res.status(201).json({
        success: true,
        message: "Tipo de documento creado exitosamente",
        data: tipoDocumento,
      })
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request<{id: string}, unknown, UpdateTipoDocumentoDTO>, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const {tipo_documento: TipoDocumentoData} = req.body
      const tipoDocumento = await TipoDocumentoRepository.update(id, TipoDocumentoData)

      if (!tipoDocumento) {
        throw new AppError("Tipo de documento no encontrado o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Tipo de documento actualizado exitosamente",
        data: tipoDocumento,
      })
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const tipoDocumento = await TipoDocumentoRepository.delete(id)

      if (!tipoDocumento) {
        throw new AppError("Tipo de documento no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        message: "Tipo de documento eliminado exitosamente",
      })
    } catch (error) {
      next(error)
    }
  }
}
