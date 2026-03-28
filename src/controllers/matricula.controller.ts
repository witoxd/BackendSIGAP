import type { Request, Response } from "express"
import { MatriculaRepository } from "../models/Repository/MatriculaRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { CreateMatriculaDTO, UpdateMatriculaDTO } from "../types"
import { PeriodoMatriculaRepository } from "../models/Repository/PeriodoMatriculaRepository"
import { asyncHandler } from "../utils/asyncHandler"


export class MatriculaController {

   getAll = asyncHandler( async (req: Request, res: Response) => {
    const limit = Number.parseInt(req.query.limit as string) || 50
    const offset = Number.parseInt(req.query.offset as string) || 0

    const matriculas = await MatriculaRepository.findAll(limit, offset)
    const total = await MatriculaRepository.count()

    res.status(200).json({
      success: true,
      data: matriculas,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    })
  })

   getById = asyncHandler( async (req: Request, res: Response) => {
    const { id } = req.params
    const matricula = await MatriculaRepository.findById(Number(id))

    if (!matricula) {
      throw new AppError("Matrícula no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: matricula,
    })
  })

   getByEstudiante = asyncHandler ( async (req: Request, res: Response) => {
    const estudiante_id = Number(req.params)
    const matriculas = await MatriculaRepository.findByEstudiante(estudiante_id)

    res.status(200).json({
      success: true,
      data: matriculas,
    })
  })

   getByCurso = asyncHandler( async (req: Request, res: Response) => {
    const curso_id = Number(req.params)
    const matriculas = await MatriculaRepository.findByCurso(curso_id)

    res.status(200).json({
      success: true,
      data: matriculas,
    })
  })

   create = asyncHandler ( async (req: Request, res: Response) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const { matricula: matriculaData } = req.body as CreateMatriculaDTO

    // 1. Resolver período activo automáticamente
    const periodoActivo = await PeriodoMatriculaRepository.findActivo()
    if (!periodoActivo) {
      throw new AppError("No hay período de matrícula activo", 400)
    }

    // 2. El UNIQUE(estudiante_id, periodo_id) en la BD ya previene duplicados,
    //    pero puedes dar un mensaje más amigable verificando antes:
    const existente = await MatriculaRepository.findByEstudianteAndPeriodo(
      matriculaData.estudiante_id,
      periodoActivo.periodo_id
    )
    if (existente) {
      throw new AppError("El estudiante ya tiene matrícula en el período activo", 409)
    }

    // 3. Crear con periodo_id resuelto
    const matricula = await MatriculaRepository.create({
      ...matriculaData,
      periodo_id: periodoActivo.periodo_id
    })

  
    res.status(201).json({
      success: true,
      data: matricula,
      message: "Matrícula creada exitosamente",
    })
  })

   update = asyncHandler( async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError("Errores de validación", 400, errors.array())
    }

    const id = Number(req.params.id)

    const { matricula: matriculaData } = req.body as UpdateMatriculaDTO
    const matricula = await MatriculaRepository.update(id, matriculaData)

    if (!matricula) {
      throw new AppError("Matrícula no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: matricula,
      message: "Matrícula actualizada exitosamente",
    })
  })

   delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const matricula = await MatriculaRepository.delete(Number(id))

    if (!matricula) {
      throw new AppError("Matrícula no encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: matricula,
      message: "Matrícula eliminada exitosamente",
    })
  })
}
