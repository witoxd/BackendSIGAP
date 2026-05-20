import type { Request, Response } from "express"
import { AuthService } from "../services/auth.service"
import { asyncHandler } from "../utils/asyncHandler"

const authService = new AuthService()

const isProduction = process.env.NODE_ENV === "production"

const ACCESS_COOKIE = "sigap_access"
const REFRESH_COOKIE = "sigap_refresh"

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  maxAge: 15 * 60 * 1000, // 15 minutos
}

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
}

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body)

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: result,
    })
  })

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, contraseña } = req.body
    const result = await authService.login(email, contraseña)

    res.cookie(ACCESS_COOKIE, result.accessToken, accessCookieOptions)
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions)

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: { user: result.user },
    })
  })

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token: string | undefined = req.cookies?.[REFRESH_COOKIE]
    if (!token) {
      res.status(401).json({ success: false, message: "Refresh token no proporcionado" })
      return
    }

    const result = await authService.refreshAccessToken(token)

    res.cookie(ACCESS_COOKIE, result.accessToken, accessCookieOptions)
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions)

    res.status(200).json({ success: true, message: "Token renovado exitosamente" })
  })

  logout = asyncHandler(async (req: Request, res: Response) => {
    if (req.user) {
      await authService.revokeAllRefreshTokens(req.user.userId)
    }

    res.clearCookie(ACCESS_COOKIE)
    res.clearCookie(REFRESH_COOKIE)

    res.status(200).json({ success: true, message: "Sesión cerrada exitosamente" })
  })

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const { currentPassword, newPassword } = req.body

    const result = await authService.changePassword(userId, currentPassword, newPassword)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })

  me = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: req.user,
    })
  })

  createUserWithPersona = asyncHandler(async (req: Request, res: Response) => {
    const { user: userData, persona: personaData, role } = req.body
    const result = await authService.createUserWithPersona(userData, personaData, role)

    res.status(201).json({
      success: true,
      message: "Usuario y persona creados exitosamente",
      data: result,
    })
  })

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const personaId = Number(req.params.personaId)
    const { user: userData, role } = req.body
    const result = await authService.createUser(userData, personaId, role)

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: result,
    })
  })

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const personaId = Number(req.params.id)

    const result = await authService.resetPasswordByDefaultDocument(personaId)

    res.status(200).json({
      success: true,
      message: "Contraseña restablecida exitosamente",
      data: result,
    })
  })
}
