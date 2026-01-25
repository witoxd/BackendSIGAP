import { body, type ValidationChain } from "express-validator"

// HTTP Validators - Validacion de estructura de request
export const createUsuarioHttpValidator: ValidationChain[] = [
  body("usuario")
    .isObject()
    .withMessage("El objeto usuario es requerido"),
  body("persona")
    .isObject()
    .withMessage("El objeto persona es requerido"),
  body("usuario.username")
    .isString()
    .withMessage("El username debe ser texto")
    .notEmpty()
    .withMessage("El username es requerido")
    .isLength({ min: 3, max: 50 })
    .withMessage("El username debe tener entre 3 y 50 caracteres")
    .isAlphanumeric()
    .withMessage("El username solo debe contener letras y numeros"),
  body("usuario.email")
    .isEmail()
    .withMessage("El email debe ser un correo valido")
    .normalizeEmail(),
  body("usuario.contraseña")
    .isString()
    .withMessage("La contrasena debe ser texto")
    .notEmpty()
    .withMessage("La contrasena es requerida")
    .isLength({ min: 8 })
    .withMessage("La contrasena debe tener al menos 8 caracteres"),
  body("usuario.activo")
    .optional()
    .isBoolean()
    .withMessage("El estado activo debe ser booleano"),
  // Persona fields
  body("persona.nombres")
    .isString()
    .withMessage("Los nombres deben ser texto")
    .notEmpty()
    .withMessage("Los nombres son requeridos"),
  body("persona.apellido_paterno")
    .optional()
    .isString()
    .withMessage("El apellido paterno debe ser texto"),
  body("persona.apellido_materno")
    .optional()
    .isString()
    .withMessage("El apellido materno debe ser texto"),
  body("persona.tipo_documento_id")
    .isInt({ min: 1 })
    .withMessage("El tipo de documento es requerido"),
  body("persona.numero_documento")
    .isString()
    .withMessage("El numero de documento debe ser texto")
    .notEmpty()
    .withMessage("El numero de documento es requerido"),
  body("persona.fecha_nacimiento")
    .isISO8601()
    .withMessage("La fecha de nacimiento debe ser una fecha valida"),
  body("persona.genero")
    .isIn(["Masculino", "Femenino", "Otro"])
    .withMessage("El genero debe ser Masculino, Femenino u Otro"),
]

export const updateUsuarioHttpValidator: ValidationChain[] = [
  body("usuario")
    .optional()
    .isObject()
    .withMessage("El objeto usuario debe ser un objeto"),
  body("persona")
    .optional()
    .isObject()
    .withMessage("El objeto persona debe ser un objeto"),
  body("usuario.username")
    .optional()
    .isString()
    .withMessage("El username debe ser texto")
    .isLength({ min: 3, max: 50 })
    .withMessage("El username debe tener entre 3 y 50 caracteres")
    .isAlphanumeric()
    .withMessage("El username solo debe contener letras y numeros"),
  body("usuario.email")
    .optional()
    .isEmail()
    .withMessage("El email debe ser un correo valido")
    .normalizeEmail(),
  body("usuario.contraseña")
    .optional()
    .isString()
    .withMessage("La contrasena debe ser texto")
    .isLength({ min: 8 })
    .withMessage("La contrasena debe tener al menos 8 caracteres"),
  body("usuario.activo")
    .optional()
    .isBoolean()
    .withMessage("El estado activo debe ser booleano"),
  // Persona fields (optional for update)
  body("persona.nombres")
    .optional()
    .isString()
    .withMessage("Los nombres deben ser texto"),
  body("persona.apellido_paterno")
    .optional()
    .isString()
    .withMessage("El apellido paterno debe ser texto"),
  body("persona.apellido_materno")
    .optional()
    .isString()
    .withMessage("El apellido materno debe ser texto"),
]

// Legacy exports for backward compatibility
export const createUsuarioValidator = createUsuarioHttpValidator
export const updateUsuarioValidator = updateUsuarioHttpValidator
