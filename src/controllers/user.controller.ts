import type { Request, Response, NextFunction } from "express"
import { UserService } from "../services/user.service"

const userService = new UserService()

export class UserController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id)
      const user = await userService.getUserById(userId)

      res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, nombres, numero_documento, role, page = 1, limit = 10, sortBy, sortOrder } = req.query

      const result = await userService.searchUsers({
        query: query as string,
        nombres: nombres as string,
        numero_documento: numero_documento as string,
        role: role as string,
        pagination: {
          page: Number.parseInt(page as string),
          limit: Math.min(Number.parseInt(limit as string), 10), // Máximo 10 resultados
          sortBy: sortBy as string,
          sortOrder: sortOrder as "ASC" | "DESC",
        },
      })

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      })
    } catch (error) {
      next(error)
    }
  }

  async assignAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = Number(req.params.id)
      const adminUserId = req.user!.userId

      const result = await userService.assignAdminRole(targetUserId, adminUserId)

      res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  }

  async transferAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const fromUserId = req.user!.userId
      const toUserId = Number.parseInt(req.body.toUserId)

      const result = await userService.transferAdminRole(fromUserId, toUserId)

      res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id)
      const  activo  = req.params.activo === "true" // Convertir a booleano

      const result = await userService.toggleUserStatus(userId, activo)

      res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  }
}
