import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan"
import dotenv from "dotenv"
import chalk from "chalk"
import figlet from "figlet"
import { errorHandler } from "./middleware/errorHandler"
import { notFoundHandler } from "./middleware/notFoundHandler"
import { rateLimiter } from "./middleware/rateLimiter"
import { testConnection, closeConnections } from "./config/database"
import routes from "./routes"
import { initializeModels } from "./models/sequelize/sequelize-models"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "localhost"

// Security middleware
app.use(helmet())
app.use(compression())

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"]
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  }),
)

// Body parser
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
} else {
  app.use(morgan("combined"))
}

// Rate limiting
app.use(rateLimiter)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API Routes
app.use("/api", routes)

// Error handlers
app.use(notFoundHandler)
app.use(errorHandler)

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server")
  await closeConnections()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server")
  await closeConnections()
  process.exit(0)
})

// Start server
const startServer = async () => {
  try {
    initializeModels()

    // Test database connection
    const dbConnected = await testConnection()

    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Server not started.")
      process.exit(1)
    }

    app.listen(PORT, () => {
      console.log(chalk.green(figlet.textSync("(SIGAP)", { horizontalLayout: "full" })))
      console.log(chalk.blueBright.bold(` Corriendo Server en http://${HOST}:${PORT}`))
      console.log(chalk.blueBright.bold(` Entorno: ${process.env.NODE_ENV || "development"}`))
      console.log(` API Routes: http://${HOST}:${PORT}/api`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

export default app
