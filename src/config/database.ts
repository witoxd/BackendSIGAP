import { Pool, type PoolConfig } from "pg"
import { Sequelize } from "sequelize"
import dotenv from "dotenv"


dotenv.config()

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "almirante_padilla",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  min: Number.parseInt(process.env.DB_POOL_MIN || "2"),
  max: Number.parseInt(process.env.DB_POOL_MAX || "10"),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: Number.parseInt(process.env.DB_TIMEOUT || "5000"),
  statement_timeout: Number.parseInt(process.env.DB_TIMEOUT || "5000"),
}

// pg Pool - Para queries SQL directas y consultas complejas optimizadas
export const pool = new Pool(poolConfig)

// Sequelize - Para operaciones CRUD, validaciones y relaciones
export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "almirante_padilla",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  pool: {
    min: Number.parseInt(process.env.DB_POOL_MIN || "2"),
    max: Number.parseInt(process.env.DB_POOL_MAX || "10"),
    acquire: Number.parseInt(process.env.DB_TIMEOUT || "5000"),
    idle: 30000,
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  define: {
    timestamps: false, // Manejamos manualmente las fechas
    underscored: true, // Usa snake_case para nombres de columnas
  },
})

// Manejo de errores del pool
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err)
})

// SEGURIDAD: Siempre usa $1, $2, $3... con array de params para prevenir SQL injection
export const query = async (
  text: string,
  params?: any[],
  client?: any
) => {
  const executor = client ?? pool

  const start = Date.now()
  try {
    const res = await executor.query(text, params)

    if (process.env.NODE_ENV === "development") {
      console.log("Executed query", {
        text,
        rows: res.rowCount,
        tx: !!client,
      })
    }

    return res
  } catch (error: any) {
    console.error("Database query error:", {
      text,
      error: error.message,
    })
    throw error
  }
}


// Función para transacciones con pg Pool
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

// Test de conexión para ambos sistemas
export const testConnection = async () => {
  try {
    // Test pg Pool
    const poolResult = await query("SELECT NOW() as now, version() as version")
    console.log("pg pool conectado exitosamente - pg Pool connected successfully")
    console.log("   Database version:", poolResult.rows[0].version.split(" ")[0])

    // Test Sequelize
    await sequelize.authenticate()
    //Advertencia no tocar sync en producción, puede causar pérdida de datos.
    await sequelize.sync({ force: false })
    console.log("Sequelize conectado exitosamente - Sequelize connected successfully")

    return true
  } catch (error) {
    console.error("conexion fallida con la base de datos - Database connection failed:", error)
    return false
  }
}

export const closeConnections = async () => {
  try {
    await pool.end()
    await sequelize.close()
    console.log("Conexion de base de datos cerradas - Database connections closed")
  } catch (error) {
    console.error("Error al intentar la conexion la base de datos - Error closing database connections:", error)
  }
}

export default pool
