import type { Request, Response } from "express"
import { CursoRepository } from "../models/Repository/CursoRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { CreateCursoDTO, updateCursoDTO } from "../types"
import { asyncHandler } from "../utils/asyncHandler"

export class CursoController{

  getAll = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number.parseInt(req.query.limit as string) || 50
  const offset = Number.parseInt(req.query.offset as string) || 0

  const cursos = await CursoRepository.findAll(limit, offset)
  const total = await CursoRepository.count()

  res.status(200).json({
    success: true,
    data: cursos,
    pagination: {
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    },
  })
})

  getById = asyncHandler (async (req: Request, res: Response) => {
  const  id  = Number(req.params.id)
  const curso = await CursoRepository.findById(id)

  if (!curso) {
    throw new AppError("Curso no encontrado", 404)
  }

  res.status(200).json({
    success: true,
    data: curso,
  })
})

//  async getByProfesor (req: Request, res: Response) {
//   const profesor_id = Number(req.params.id)
//   const cursos = await CursoRepository.findByProfesor(profesor_id)

//   res.status(200).json({
//     success: true,
//     data: cursos,
//   })
// }

  create = asyncHandler(async (req: Request, res: Response)  => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new AppError("Errores de validación", 400, errors.array())
  }

  const  {curso: CursoData}  = req.body as CreateCursoDTO

  const curso = await CursoRepository.create(CursoData)

  res.status(201).json({
    success: true,
    data: curso,
    message: "Curso creado exitosamente",
  })
})

  update = asyncHandler (async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new AppError("Errores de validación", 400, errors.array())
  }

  const  id  = Number(req.params.id)

  const {curso: CursoData} = req.body as updateCursoDTO

  const curso = await CursoRepository.update(id, CursoData)

  if (!curso) {
    throw new AppError("Curso no encontrado", 404)
  }

  res.status(200).json({
    success: true,
    data: curso,
    message: "Curso actualizado exitosamente",
  })
})

  delete = asyncHandler( async (req: Request, res: Response)  => {
  const id = Number(req.params.id)
  const curso = await CursoRepository.delete(id)

  if (!curso) {
    throw new AppError("Curso no encontrado", 404)
  }

  res.status(200).json({
    success: true,
    data: curso,
    message: "Curso eliminado exitosamente",
  })
})

}
