import type { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.service"
import { asyncHandler } from "../utils/asyncHandler"

const authService = new AuthService()

export class AuthController {
   register = asyncHandler(async (req: Request, res: Response, next: NextFunction)  => {
      const result = await authService.register(req.body)

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: result,
      })
  })

   login = asyncHandler( async (req: Request, res: Response, next: NextFunction)  =>{
      const { email, contraseña } = req.body
      const result = await authService.login(email, contraseña)

      res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso",
        data: result,
      })
  })

   changePassword = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
  
      const userId = req.user!.userId
      const { currentPassword, newPassword } = req.body

      const result = await authService.changePassword(userId, currentPassword, newPassword)

      res.status(200).json({
        success: true,
        message: result.message,
      })
  })

   me = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

      res.status(200).json({
        success: true,
        message: "Contraseña restablecida exitosamente",
        data: req.user,
      })
  })

   createUserWithPersona = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { user: userData, persona: personaData, role } = req.body
      const result = await authService.createUserWithPersona(userData, personaData, role)

      res.status(201).json({
        success: true,
        message: "Usuario y persona creados exitosamente",
        data: result,
      })
  })

     createUser  = asyncHandler (async (req: Request, res: Response, next: NextFunction) => {

      const personaId = Number(req.params.personaId)
      const { user: userData, role } = req.body
      const result = await authService.createUser(userData, personaId, role)

      res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: result,
      })
})

   resetPassword = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
       const personaId = Number(req.params.id)

       const result = await authService.resetPasswordByDefaultDocument(personaId)

       res.status(200).json({
         success: true,
         message: "Contraseña restablecida exitosamente",
         data: result,
       })
  })

}
