// =============================================================================
// CONFIGURACIÓN DE SWAGGER / OPENAPI
// =============================================================================
//
// swagger-jsdoc lee los comentarios JSDoc con @swagger en las rutas
// y genera un JSON de especificación OpenAPI 3.0.
//
// swagger-ui-express sirve una interfaz visual en /api/docs
// donde puedes ver y probar todos los endpoints del navegador.
//


import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import type { Express } from "express"

// -----------------------------------------------------------------------------
// Definición base de la API (metadata)
// -----------------------------------------------------------------------------
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "SIGAP API",
    version: "3.3.3",
    description: "Sistema de Gestión Académica — API REST",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}/api`,
      description: "Servidor de desarrollo",
    },
  ],

  // Componentes reutilizables: schemas, respuestas, parámetros comunes
  components: {
    // Esquema de autenticación JWT
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT obtenido en POST /auth/login",
      },
    },

    // Schemas reutilizables — se referencian con $ref: '#/components/schemas/Nombre'
    schemas: {
      // Respuesta de error genérica
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Recurso no encontrado" },
        },
      },

      // Paginación reutilizable
      Pagination: {
        type: "object",
        properties: {
          page:  { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 150 },
          pages: { type: "integer", example: 8 },
        },
      },

      // Schema de Auditoría
      Auditoria: {
        type: "object",
        properties: {
          auditoria_id:    { type: "integer",  example: 1 },
          usuario_id:      { type: "integer",  example: 10 },
          accion:          { type: "string",   example: "CREATE" },
          tabla:           { type: "string",   example: "personas" },
          registro_id:     { type: "integer",  example: 42 },
          datos_anteriores:{ type: "object",   nullable: true },
          datos_nuevos:    { type: "object",   nullable: true },
          fecha_accion:    { type: "string",   format: "date-time" },
          username:        { type: "string",   example: "jperez" },
          nombres:         { type: "string",   example: "Juan" },
          apellido_paterno:{ type: "string",   example: "Pérez" },
        },
      },
    },

    // Respuestas comunes reutilizables
    responses: {
      Unauthorized: {
        description: "Token no proporcionado o inválido",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Forbidden: {
        description: "Sin permisos para este recurso",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Recurso no encontrado",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },

  // Seguridad global: todos los endpoints requieren JWT por defecto
  // Un endpoint puede sobrescribir esto con security: [] para ser público
  security: [{ bearerAuth: [] }],
}

// -----------------------------------------------------------------------------
// Opciones de swagger-jsdoc
// Lee los comentarios @swagger de los archivos de rutas
// -----------------------------------------------------------------------------
const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  // Archivos donde buscar comentarios @swagger
  // Agregar más patrones si se agregan rutas en subdirectorios
  apis: ["./src/routes/*.ts"],
}

// Genera el JSON de especificación OpenAPI
export const swaggerSpec = swaggerJsdoc(options)

// -----------------------------------------------------------------------------
// Función para registrar Swagger en la app Express
// Se llama desde server.ts
// -----------------------------------------------------------------------------
export const setupSwagger = (app: Express): void => {
  // Interfaz visual — disponible solo fuera de producción
  if (process.env.NODE_ENV !== "production") {
    app.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: "SIGAP API Docs",
        // Persiste la autorización al recargar la página
        swaggerOptions: { persistAuthorization: true },
      })
    )
  }

  // El JSON crudo siempre disponible (útil para generar clientes)
  app.get("/api/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
  })
}
