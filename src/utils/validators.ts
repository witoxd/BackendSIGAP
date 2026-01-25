import { body, query, param, type ValidationChain } from "express-validator"

// Validadores de autenticación
export const registerValidator: ValidationChain[] = [
  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username debe tener entre 3 y 50 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username solo puede contener letras, números y guiones bajos"),
  body("contraseña")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage("La contraseña debe contener al menos una mayúscula y una minúscula"),
  body("nombres")
    .notEmpty()
    .withMessage("Los nombres son requeridos")
    .isLength({ max: 100 })
    .withMessage("Nombres demasiado largos"),
  body("apellido_paterno").optional().isLength({ max: 100 }).withMessage("Apellido paterno demasiado largo"),
  body("apellido_materno").optional().isLength({ max: 100 }).withMessage("Apellido materno demasiado largo"),
  body("numero_documento").optional().isLength({ max: 20 }).withMessage("Número de documento inválido"),
  body("fecha_nacimiento").isISO8601().withMessage("Fecha de nacimiento inválida"),
  body("genero").optional().isIn(["Masculino", "Femenino", "Otro"]).withMessage("Género inválido"),
  body("role")
    .notEmpty()
    .withMessage("El rol es requerido")
    .isIn(["estudiante", "profesor", "administrativo", "administrador"])
    .withMessage("Rol inválido"),
]

export const loginValidator: ValidationChain[] = [
  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
  body("contraseña").notEmpty().withMessage("La contraseña es requerida"),
]

export const changePasswordValidator: ValidationChain[] = [
  body("currentPassword").notEmpty().withMessage("La contraseña actual es requerida"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("La nueva contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage("La contraseña debe contener al menos una mayúscula y una minúscula"),
]

// Validadores de búsqueda
export const searchValidator: ValidationChain[] = [
  query("query").optional().isLength({ min: 1, max: 100 }).withMessage("Búsqueda inválida"),
  query("nombres").optional().isLength({ min: 1, max: 100 }).withMessage("Nombres inválidos"),
  query("numero_documento").optional().isLength({ min: 1, max: 20 }).withMessage("Número de documento inválido"),
  query("page").optional().isInt({ min: 1 }).withMessage("Página debe ser un número positivo"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Límite debe estar entre 1 y 100"),
]

// Validador de ID
export const idValidator: ValidationChain[] = [param("id").isInt({ min: 1 }).withMessage("ID inválido")]

// Función para obtener paginación
export const getPagination = (page?: string, limit?: string) => {
  const pageNum = page ? Math.max(1, Number.parseInt(page)) : 1
  const limitNum = limit ? Math.min(100, Math.max(1, Number.parseInt(limit))) : 50
  const offset = (pageNum - 1) * limitNum

  return { limit: limitNum, offset, page: pageNum }
}
