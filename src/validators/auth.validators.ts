import { body, param, type ValidationChain } from "express-validator"
import { createPersonaHttpValidator } from "./persona.validators"

const passwordValidator = (field: string, label: string) =>
  body(field)
    .isString()
    .withMessage(`${label} debe ser texto`)
    .isLength({ min: 8 })
    .withMessage(`${label} debe tener al menos 8 caracteres`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage(`${label} debe contener al menos una mayuscula y una minuscula`)

const userBaseHttpValidator: ValidationChain[] = [
  body("user")
    .isObject()
    .withMessage("El objeto user es requerido"),
  body("user.username")
    .isString()
    .withMessage("El username debe ser texto")
    .isLength({ min: 3, max: 50 })
    .withMessage("El username debe tener entre 3 y 50 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("El username solo puede contener letras, numeros y guiones bajos"),
  body("user.email")
    .isEmail()
    .withMessage("El email es invalido")
    .normalizeEmail(),
  passwordValidator("user.contraseña", "La contraseña"),
  body("user.activo")
    .optional()
    .isBoolean()
    .withMessage("El campo activo debe ser booleano"),
]

export const createUserHttpValidator: ValidationChain[] = [
  param("personaId")
    .isInt({ min: 1 })
    .withMessage("El personaId debe ser un numero entero positivo"),
  ...userBaseHttpValidator,
  body("role")
    .isString()
    .withMessage("El rol debe ser texto")
    .isIn(["admin", "estudiante", "profesor", "administrativo"])
    .withMessage("El rol debe ser admin, estudiante, profesor o administrativo"),
]

export const createUserWithPersonaHttpValidator: ValidationChain[] = [
  ...userBaseHttpValidator,
  body("persona")
    .isObject()
    .withMessage("El objeto persona es requerido"),
  ...createPersonaHttpValidator,
  body("role")
    .isString()
    .withMessage("El rol debe ser texto")
    .isIn(["admin", "estudiante", "profesor", "administrativo"])
    .withMessage("El rol debe ser admin, estudiante, profesor o administrativo"),
]

export const resetPasswordHttpValidator: ValidationChain[] = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID de persona debe ser un numero entero positivo"),
]

