import type { Request, Response, NextFunction } from "express"
import { TipoArchivoRepository } from "../models/Repository/TipoArchivoRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import type { CreateTipoArchivoDTO, UpdateTipoArchivoDTO } from "../types"
import { asyncHandler } from "../utils/asyncHandler"
import { ContextoArchivo as ContextoArchivoEnum} from "../types"

export class TipoArchivoController {
  /**
   * Obtener todos los tipos de archivo
   */
   getAll = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
  
      const tiposArchivo = await TipoArchivoRepository.findAll()

      res.status(200).json({
        success: true,
        data: tiposArchivo,
      })

  })

  /**
   * Obtener tipo de archivo por rol de perosna
   */

   getRolByTipoArchivo = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

      const rol = req.params.rol as ContextoArchivoEnum

      if(!Object.values(ContextoArchivoEnum).includes(rol)) {
        throw new AppError("Rol de persona no válido", 400)
      }

      const tiposArchivo = await TipoArchivoRepository.findByRol(rol)

      if (!tiposArchivo.length) {
        throw new AppError("No se encontraron tipos de archivo para el rol indicado", 404)
      }

      res.status(200).json({
        success: true,
        data: tiposArchivo,
      })
  })

  /**
   * Obtener tipo de archivo por ID
   */
   getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  
      const id = Number(req.params.id)
      const tipoArchivo = await TipoArchivoRepository.findById(id)

      if (!tipoArchivo) {
        throw new AppError("Tipo de archivo no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: tipoArchivo,
      })
  })

  /**
   * Buscar tipo de archivo por nombre
   */
   getByNombre = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {

      const { nombre } = req.params
      const tipoArchivo = await TipoArchivoRepository.findByNombre(nombre as string)

      if (!tipoArchivo) {
        throw new AppError("Tipo de archivo no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        data: tipoArchivo,
      })
  })

  /**
   * Crear un nuevo tipo de archivo
   */
   create = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const { tipo_archivo: TipoArchivoData } = req.body as CreateTipoArchivoDTO

      // Verificar que no exista un tipo con el mismo nombre
      const existingTipo = await TipoArchivoRepository.findByNombre(TipoArchivoData.nombre)
      if (existingTipo) {
        throw new AppError("Ya existe un tipo de archivo con ese nombre", 409)
      }

      const tipoArchivo = await TipoArchivoRepository.create(TipoArchivoData)

      res.status(201).json({
        success: true,
        message: "Tipo de archivo creado exitosamente",
        data: tipoArchivo,
      })
  })

  /**
   * Actualizar un tipo de archivo
   */
   update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
 
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new AppError("Errores de validación", 400, errors.array())
      }

      const id = Number(req.params.id)
      const { tipo_archivo: TipoArchivoData } = req.body as UpdateTipoArchivoDTO

      const existingTipo = await TipoArchivoRepository.findById(id)
      if (!existingTipo) {
        throw new AppError("Tipo de archivo no encontrado", 404)
      }

      // Si se intenta cambiar el nombre, verificar que no exista otro con ese nombre
      if (TipoArchivoData.nombre && TipoArchivoData.nombre !== existingTipo.nombre) {
        const tipoConNombre = await TipoArchivoRepository.findByNombre(TipoArchivoData.nombre)
        if (tipoConNombre) {
          throw new AppError("Ya existe otro tipo de archivo con ese nombre", 409)
        }
      }

      const tipoArchivo = await TipoArchivoRepository.update(id, TipoArchivoData)

      if (!tipoArchivo) {
        throw new AppError("Tipo de archivo no encontrado o sin cambios", 404)
      }

      res.status(200).json({
        success: true,
        message: "Tipo de archivo actualizado exitosamente",
        data: tipoArchivo,
      })
  })

  /**
   * Eliminar un tipo de archivo (soft delete)
   */
   delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

      const id = Number(req.params.id)
      const tipoArchivo = await TipoArchivoRepository.softDelete(id)

      if (!tipoArchivo) {
        throw new AppError("Tipo de archivo no encontrado", 404)
      }

      res.status(200).json({
        success: true,
        message: "Tipo de archivo eliminado exitosamente",
      })
  })

  /**
   * Verificar si una extensión es permitida
   */
   checkExtension = asyncHandler(async(req: Request, res: Response, next: NextFunction)  => {
      const id = Number(req.params.id)
      const { extension } = req.query

      if (!extension) {
        throw new AppError("La extensión es requerida", 400)
      }

      const isAllowed = await TipoArchivoRepository.isExtensionAllowed(
        id,
        extension as string
      )

      res.status(200).json({
        success: true,
        data: {
          tipo_archivo_id: id,
          extension,
          permitida: isAllowed,
        },
      })
  }) 

}
