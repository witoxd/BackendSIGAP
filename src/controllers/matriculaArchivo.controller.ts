import type { Request, Response } from "express"
import { MatriculaArchivoRepository } from "../models/Repository/MatriculaArchivoRepository"
import { MatriculaRepository } from "../models/Repository/MatriculaRepository"
import { ArchivoRepository } from "../models/Repository/ArchivoRepository"
import { AppError } from "../utils/AppError"
import { asyncHandler } from "../utils/asyncHandler"
import { validationResult } from "express-validator"

export class MatriculaArchivoController {

  // ----------------------------------------------------------
  // getByMatricula — todos los archivos asociados a una matrícula
  // con info del tipo de archivo para mostrar el checklist
  // ----------------------------------------------------------
  getByMatricula = asyncHandler(async (req: Request, res: Response) => {
    const matriculaId = Number(req.params.matriculaId)

    const matricula = await MatriculaRepository.findById(matriculaId)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    const archivos = await MatriculaArchivoRepository.findByMatricula(matriculaId)

    res.status(200).json({ success: true, data: archivos })
  })

  // ----------------------------------------------------------
  // getArchivosRequeridos — checklist de documentos obligatorios
  // Responde: { entregado: true/false } por cada tipo requerido.
  // El frontend usa esto para saber qué falta por subir.
  // ----------------------------------------------------------
  getArchivosRequeridos = asyncHandler(async (req: Request, res: Response) => {
    const matriculaId = Number(req.params.matriculaId)

    const matricula = await MatriculaRepository.findById(matriculaId)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    const checklist = await MatriculaArchivoRepository.findArchivosRequeridos(matriculaId)
    const faltantes = checklist.filter((item: any) => !item.entregado)

    res.status(200).json({
      success:   true,
      completo:  faltantes.length === 0,
      faltantes: faltantes.length,
      data:      checklist,
    })
  })

  // ----------------------------------------------------------
  // asociar — vincula un archivo existente a una matrícula.
  //
  // El archivo ya debe existir en la tabla `archivos` (fue subido
  // previamente o en el mismo request por el endpoint de archivos).
  // Validaciones:
  //   1. La matrícula existe
  //   2. El archivo existe y pertenece al estudiante de esa matrícula
  // ----------------------------------------------------------
  asociar = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const matriculaId = Number(req.params.matriculaId)
    const { archivo_id } = req.body

    const matricula = await MatriculaRepository.findById(matriculaId)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    const archivo = await ArchivoRepository.findById(Number(archivo_id))
    if (!archivo) throw new AppError("Archivo no encontrado", 404)

    // El archivo debe pertenecer al estudiante de la matrícula
    // Esto evita que alguien asocie documentos de otra persona
    if (archivo.persona_id !== matricula.persona_id) {
      throw new AppError(
        "El archivo no pertenece al estudiante de esta matrícula",
        403
      )
    }

    const asociacion = await MatriculaArchivoRepository.asociar({
      matricula_id: matriculaId,
      archivo_id:   Number(archivo_id),
    })

    // Si ON CONFLICT DO NOTHING no insertó nada, ya estaba asociado
    if (!asociacion) {
      return res.status(200).json({
        success: true,
        message: "El archivo ya estaba asociado a esta matrícula",
      })
    }

    res.status(201).json({
      success: true,
      message: "Archivo asociado a la matrícula exitosamente",
      data:    asociacion,
    })
  })

  // ----------------------------------------------------------
  // asociarBulk — asocia varios archivos a la vez.
  // Útil cuando el estudiante sube todos los documentos juntos.
  // ----------------------------------------------------------
  asociarBulk = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError("Errores de validación", 400, errors.array())

    const matriculaId = Number(req.params.matriculaId)
    const { archivo_ids } = req.body as { archivo_ids: number[] }

    const matricula = await MatriculaRepository.findById(matriculaId)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    // Verificar que todos los archivos existen y pertenecen al estudiante
    for (const archivoId of archivo_ids) {
      const archivo = await ArchivoRepository.findById(archivoId)
      if (!archivo) {
        throw new AppError(`Archivo con ID ${archivoId} no encontrado`, 404)
      }
      if (archivo.persona_id !== matricula.persona_id) {
        throw new AppError(
          `El archivo ${archivoId} no pertenece al estudiante de esta matrícula`,
          403
        )
      }
    }

    const asociaciones = await MatriculaArchivoRepository.asociarBulk(
      matriculaId,
      archivo_ids
    )

    res.status(201).json({
      success: true,
      message: `${asociaciones.length} archivo(s) asociado(s) a la matrícula`,
      data:    asociaciones,
    })
  })

  // ----------------------------------------------------------
  // desasociar — quita el vínculo entre un archivo y la matrícula.
  // El archivo físico NO se elimina.
  // ----------------------------------------------------------
  desasociar = asyncHandler(async (req: Request, res: Response) => {
    const matriculaId = Number(req.params.matriculaId)
    const archivoId   = Number(req.params.archivoId)

    const resultado = await MatriculaArchivoRepository.desasociar(
      matriculaId,
      archivoId
    )

    if (!resultado) {
      throw new AppError("La asociación no existe", 404)
    }

    res.status(200).json({
      success: true,
      message: "Archivo desasociado de la matrícula exitosamente",
    })
  })
}
