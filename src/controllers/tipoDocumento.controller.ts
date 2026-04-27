import type { Request, Response } from "express"
import { TipoDocumentoRepository } from "../models/Repository/TipoDocumentoRepository"
import { AppError } from "../utils/AppError"
import { CreateTipoDocumentoDTO, UpdateTipoDocumentoDTO } from "../types"
import { asyncHandler } from "../utils/asyncHandler"


export class TipoDocumentoController {

   getAll = asyncHandler(async (req: Request, res: Response) => {
      const tiposDocumento = await TipoDocumentoRepository.findAll()

      res.status(200).json({
        success: true,
        data: tiposDocumento,
      })
  })

   getById = asyncHandler(async (req: Request, res: Response)  => {

      const id = Number(req.params.id)
      const tipoDocumento = await TipoDocumentoRepository.findById(id)

      if (!tipoDocumento) {
        throw new AppError("Tipo de documento no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: tipoDocumento,
      })
  })



   create = asyncHandler(async (req: Request, res: Response) => {

    const {tipo_documento: TipoDocumentoData } = req.body as CreateTipoDocumentoDTO

    const existingTipoDocumento = await TipoDocumentoRepository.findByName(TipoDocumentoData.tipo_documento)

    if(existingTipoDocumento){
      throw new AppError("Ya existe un tipo documento con este nombre", 404)
    }

    console.log("Data llegando", TipoDocumentoData)

      const tipoDocumento = await TipoDocumentoRepository.create(TipoDocumentoData)

      res.status(201).json({
        success: true,
        message: "Tipo de documento creado exitosamente",
        data: tipoDocumento,
      })
  })

   update = asyncHandler(async (req: Request, res: Response) => {

      const id = Number(req.params.id)
      const {tipo_documento: TipoDocumentoData} = req.body as UpdateTipoDocumentoDTO
      const tipoDocumento = await TipoDocumentoRepository.update(id, TipoDocumentoData)

      if (!tipoDocumento) {
        throw new AppError("Tipo de documento no encontrado o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Tipo de documento actualizado exitosamente",
        data: tipoDocumento,
      })
  })

   delete = asyncHandler(async (req: Request, res: Response) => {
      const id = Number(req.params.id)
      const tipoDocumento = await TipoDocumentoRepository.delete(id)

      if (!tipoDocumento) {
        throw new AppError("Tipo de documento no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        message: "Tipo de documento eliminado exitosamente",
      })
  })

}
