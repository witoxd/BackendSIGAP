import type { Request, Response, NextFunction } from "express"
import { UserService } from "../services/user.service"
import { asyncHandler } from "../utils/asyncHandler"

const userService = new UserService()

export class UserController {
   getUser = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number(req.params.id)
      const user = await userService.getUserById(userId)

      res.status(200).json({
        success: true,
        data: user,
      })
  })

   searchUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

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
  })

   assignAdmin = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {

      const targetUserId = Number(req.params.id)
      const adminUserId = req.user!.userId

      const result = await userService.assignAdminRole(targetUserId, adminUserId)

      res.status(200).json({
        success: true,
        message: result.message,
      })
  })

   transferAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

      const fromUserId = req.user!.userId
      const toUserId = Number.parseInt(req.body.toUserId)

      const result = await userService.transferAdminRole(fromUserId, toUserId)

      res.status(200).json({
        success: true,
        message: result.message,
      })
  })

   toggleStatus = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {

      const userId = Number(req.params.id)
      const  activo  = req.params.activo === "true" // Convertir a booleano

      const result = await userService.toggleUserStatus(userId, activo)

      res.status(200).json({
        success: true,
        message: result.message,
      })
  })
  
}
