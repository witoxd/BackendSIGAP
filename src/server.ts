import express        from "express"
import cors           from "cors"
import helmet         from "helmet"
import compression    from "compression"
import morgan         from "morgan"
import cookieParser   from "cookie-parser"
import dotenv         from "dotenv"
import chalk          from "chalk"
import figlet         from "figlet"
import { errorHandler }   from "./middleware/errorHandler"
import { notFoundHandler } from "./middleware/notFoundHandler"
import {
  globalIpLimiter,
  apiUserLimiter,
} from "./middleware/rateLimiter"
import { testConnection, closeConnections } from "./config/database"
import routes            from "./routes"
import { initializeModels } from "./models/sequelize/sequelize-models"
import { FORCE_DATABASE_SYNC } from "./config/database"
import { setupSwagger }  from "./config/swagger"

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "localhost"

// Leer IP real cuando hay proxy inverso (Cloudflare, nginx…)
// Usar http tunnel de claudflared me hizo percatar de este error.
app.set("trust proxy", 1)

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(compression())

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:4000"])
  .map((o) => o.trim().replace(/\/$/, ""))

app.use(
  cors({
    origin: (origin, callback) => {
      const normalized = origin?.replace(/\/$/, "")
      if (!normalized || allowedOrigins.includes(normalized)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  }),
)

// ── Cookies y parsers ─────────────────────────────────────────────────────────
app.use(cookieParser())

// Body parser con límites conservadores.
// Las rutas de archivos usan Multer (multipart) — express.json no las afecta.
// 2mb cubre cualquier payload JSON legítimo con margen; payloads mayores
// casi siempre indican un error del cliente o un intento de abuso.
app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ extended: true, limit: "2mb" }))

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
} else {
  app.use(morgan("combined"))
}

// ── Timeout de request ────────────────────────────────────────────────────────
// 60 segundos. Evita que queries lentas o conexiones colgadas acaparen el pool
// de PostgreSQL indefinidamente. El handler responde 503 y libera el socket.
// Nota del desarrollador: No confundir con statement_timeout de PostgreSQL, que cancela la query pero no cierra la conexión ni responde al cliente.
// tambien si estas leyendo esto y vas a usar querys de historial largo, considera aumentar este timeout o manejarlo con cuidado para no cancelar consultas legítimas. --- IGNORE ---
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.REQUEST_TIMEOUT_MS || "60000")
app.use((_req, res, next) => {
  res.setTimeout(REQUEST_TIMEOUT_MS, () => {
    res.status(503).json({
      success: false,
      message: "El servidor tardó demasiado en responder. Por favor, intenta de nuevo.",
      code:    "REQUEST_TIMEOUT",
    })
  })
  next()
})

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Orden importa: el limiter global por IP va primero (capa de defensa externa).
// El limiter de API por usuario se aplica solo a /api/*, con clave por userId.
app.use(globalIpLimiter)
app.use("/api", apiUserLimiter)

// ── Health check (sin autenticación ni rate limit de usuario) ─────────────────
// Endpoint simple para monitoreo de salud del servicio. No requiere autenticación ni rate limit por usuario, pero sí se beneficia del rate limit global por IP para protegerlo de abusos y aatques DOS o DDOS
// 
app.get("/health", (_req, res) => {
  res.status(200).json({
    status:    "OK",
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
  })
})

// ── Rutas de la API ───────────────────────────────────────────────────────────
app.use("/api", routes)

// ── Swagger UI ────────────────────────────────────────────────────────────────
// Documentacion de swagger 
setupSwagger(app)

// ── Manejadores de error ──────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ── Señales de cierre graceful ────────────────────────────────────────────────
process.on("SIGTERM", async () => {
  console.log("SIGTERM recibido — cerrando servidor")
  await closeConnections()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("SIGINT recibido — cerrando servidor")
  await closeConnections()
  process.exit(0)
})

// ── Arranque ──────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    initializeModels()

    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error("No se pudo conectar a la base de datos. Servidor no iniciado.")
      process.exit(1)
    }

    app.listen(PORT, () => {
      console.log(chalk.green(figlet.textSync("(SIGAP)", { horizontalLayout: "full" })))
      console.log(chalk.blueBright.bold(` Servidor en http://${HOST}:${PORT}`))
      console.log(chalk.blueBright.bold(` Entorno: ${process.env.NODE_ENV || "development"}`))
      console.log(` API: http://${HOST}:${PORT}/api`)
      console.log(` Sync forzada DB: ${FORCE_DATABASE_SYNC}`)
    })
  } catch (error) {
    console.error("Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

startServer()

export default app
