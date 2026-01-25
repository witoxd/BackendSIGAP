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
        data: req.user,
      })
    } catch (error) {
      next(error)
    }
  }
}
