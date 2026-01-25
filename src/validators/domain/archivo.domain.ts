import type { Request, Response, NextFunction } from "express"
import { Archivos } from "../../models/sequelize/Archivo"
import { ValidationError } from "sequelize"
import { toDefaultValue } from "sequelize/types/utils"

/**
 * Validador de dominio para creacion de archivo
 * Nota: url_archivo se genera automaticamente desde el archivo subido,
 * por eso se usa un valor temporal para la validacion de Sequelize
 */
export const validateCreateArchivoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // En form-data los campos vienen directamente en body (no anidados)
    const { persona_id, nombre, descripcion, tipo_archivo } = req.body

    // Construir objeto para validacion
    // url_archivo se genera despues de subir el archivo, usamos placeholder
    const archivoData = {
      persona_id: Number(persona_id),
      nombre: nombre || "archivo_temporal",
      descripcion,
      tipo_archivo,
      url_archivo: "/placeholder", // Temporal, se reemplaza con la URL real
      activo: true
    }

    // Validacion dominio con Sequelize (NO DB)
    // Saltamos la validacion de url_archivo porque se genera despues
    await Archivos.build(archivoData).validate({
      skip: ["url_archivo"],
    })

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validacion de dominio",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      })
    }

    next(error)
  }
}

/**
 * Validador de dominio para actualizacion de archivo
 */
export const validateUpdateArchivoDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nombre, descripcion, tipo_archivo, activo } = req.body

    // Solo validar campos que vienen en el request
    const archivoData: any = {}

    if (nombre !== undefined) archivoData.nombre = nombre
    if (descripcion !== undefined) archivoData.descripcion = descripcion
    if (tipo_archivo !== undefined) archivoData.tipo_archivo = tipo_archivo
    if (activo !== undefined) {
      // Convertir string a boolean si viene de form-data
      archivoData.activo = activo === "true" || activo === true
    }

    // Si no hay campos para validar, continuar
    if (Object.keys(archivoData).length === 0) {
      return next()
    }

    // Validacion dominio con Sequelize (NO DB)
    // Saltamos campos requeridos que no se actualizan
    await Archivos.build(archivoData).validate({
      skip: ["persona_id", "url_archivo", "tipo_archivo", "nombre"],
    })

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validacion de dominio",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      })
    }

    next(error)
  }
}
