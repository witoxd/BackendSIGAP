import { Router } from "express"
import { param } from "express-validator"
import { authenticate, isAdmin } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { RoleController } from "../controllers/role.controller"
import { createRoleHttpValidator, updateRoleHttpValidator } from "../validators/role.validators"

const router = Router()
const roleController = new RoleController()

router.use(authenticate)

router.get("/", isAdmin, roleController.getAllRoles.bind(roleController))

router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  isAdmin,
  roleController.getRoleById.bind(roleController),
)

router.post(
  "/",
  isAdmin,
  createRoleHttpValidator,
  validate,
  roleController.createRole.bind(roleController),
)

router.put(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  isAdmin,
  updateRoleHttpValidator,
  validate,
  roleController.updateRole.bind(roleController),
)

router.delete(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  validate,
  isAdmin,
  roleController.deleteRole.bind(roleController),
)

export default router
