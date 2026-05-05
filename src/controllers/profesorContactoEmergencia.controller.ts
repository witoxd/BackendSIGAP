import type { Request, Response } from "express"
import { ProfesorContactoEmergenciaRepository } from "../models/Repository/ProfesorContactoEmergenciaRepository"
import { ProfesorRepository } from "../models/Repository/ProfesorRepository"
import { AppError } from "../utils/AppError"
import { asyncHandler } from "../utils/asyncHandler"

export class ProfesorContactoEmergenciaController {

  getByProfesor = asyncHandler(async (req: Request, res: Response) => {
    const profesorId = Number(req.params.profesorId)
    const contactos = await ProfesorContactoEmergenciaRepository.findByProfesor(profesorId)
    res.status(200).json({ success: true, data: contactos })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const profesorId = Number(req.params.profesorId)

    const profesor = await ProfesorRepository.findById(profesorId)
    if (!profesor) throw new AppError("Profesor no encontrado", 404)

    const { nombre, parentesco, telefono, celular } = req.body
    const contacto = await ProfesorContactoEmergenciaRepository.create({
      profesor_id: profesorId,
      nombre,
      parentesco,
      telefono,
      celular: celular ?? null,
    })

    res.status(201).json({ success: true, data: contacto })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const contactoId = Number(req.params.contactoId)

    const existing = await ProfesorContactoEmergenciaRepository.findById(contactoId)
    if (!existing) throw new AppError("Contacto de emergencia no encontrado", 404)

    const updated = await ProfesorContactoEmergenciaRepository.update(contactoId, req.body)
    res.status(200).json({ success: true, data: updated })
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const contactoId = Number(req.params.contactoId)

    const existing = await ProfesorContactoEmergenciaRepository.findById(contactoId)
    if (!existing) throw new AppError("Contacto de emergencia no encontrado", 404)

    await ProfesorContactoEmergenciaRepository.delete(contactoId)
    res.status(200).json({ success: true, message: "Contacto eliminado" })
  })
}
