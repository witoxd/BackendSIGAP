import type { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.service"

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body)

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, contraseña } = req.body
      const result = await authService.login(email, contraseña)

      res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { currentPassword, newPassword } = req.body

      const result = await authService.changePassword(userId, currentPassword, newPassword)

      res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        message: "Contraseña restablecida exitosamente",
        data: req.user,
      })
    } catch (error) {
      next(error)
    }
  }

  async createUserWithPersona(req: Request, res: Response, next: NextFunction) {
    try {

      const { user: userData, persona: personaData, role } = req.body
      const result = await authService.createUserWithPersona(userData, personaData, role)

      res.status(201).json({
        success: true,
        message: "Usuario y persona creados exitosamente",
        data: result,
      })

    } catch (error){
      next(error)
    }
  }

    async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const personaId = Number(req.params.personaId)
      const { user: userData, role } = req.body
      const result = await authService.createUser(userData, personaId, role)

      res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: result,
      })

    } catch (error){
      next(error)
    }
  }

  async ResetPassword(req: Request, res: Response, next: NextFunction){
    try {
       const personaId = Number(req.params.personaId)

       const result = await authService.resetPasswordByDefaultDocument(personaId)

       res.status(200).json({
         success: true,
         message: "Contraseña restablecida exitosamente",
         data: result,
       })

    } catch (error) {
         next(error)
    }
  }
}
