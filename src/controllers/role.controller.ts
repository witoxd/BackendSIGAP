import type { Request, Response } from "express"
import { RoleRepository } from "../models/Repository/RoleRepository"
import { AppError } from "../utils/AppError"
import { validationResult } from "express-validator"
import { asyncHandler } from "../utils/asyncHandler"


export class RoleController {
  getAllRoles = asyncHandler(async (req: Request, res: Response) => {
  const roles = await RoleRepository.findAll()

  res.status(200).json({
    success: true,
    data: roles,
  })
})

  getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const  id  = Number(req.params.id)
  const role = await RoleRepository.findById(id)

  if (!role) {
    throw new AppError("Rol no encontrado", 404)
  }

  res.status(200).json({
    success: true,
    data: role,
  })
})

  getRoleByName = asyncHandler(async (req: Request, res: Response) => {
  const { nombre } = req.params
  const role = await RoleRepository.findByName(nombre as string)

  if (!role) {
    throw new AppError("Rol no encontrado", 404)
  }

  res.status(200).json({
    success: true,
    data: role,
  })
})

  createRole = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new AppError("Errores de validación", 400, errors.array())
  }

  const existingRole = await RoleRepository.findByName(req.body.nombre)
  if (existingRole) {
    throw new AppError("Ya existe un rol con ese nombre", 409)
  }

  const role = await RoleRepository.create(req.body)

  res.status(201).json({
    success: true,
    data: role,
    message: "Rol creado exitosamente",
  })
})

  updateRole = asyncHandler( async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new AppError("Errores de validación", 400, errors.array())
  }

  const id  = Number(req.params.id)

  if (req.body.nombre) {
    const existingRole = await RoleRepository.findByName(req.body.nombre)
    if (existingRole && existingRole.role_id !== id) {
      throw new AppError("Ya existe otro rol con ese nombre", 409)
    }
  }

  const role = await RoleRepository.update(id, req.body)

  if (!role) {
    throw new AppError("Rol no encontrado", 404)
  }

  res.status(200).json({
    success: true,
    data: role,
    message: "Rol actualizado exitosamente",
  })
})

  deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const  id  = Number(req.params.id)
  const role = await RoleRepository.delete(id)

  if (!role) {
    throw new AppError("Rol no encontrado", 404)
  }

  res.status(200).json({
    success: true,
    data: role,
    message: "Rol eliminado exitosamente",
  })
})

}