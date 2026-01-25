"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnections = exports.testConnection = exports.transaction = exports.query = exports.sequelize = exports.pool = void 0;
const pg_1 = require("pg");
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const poolConfig = {
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
};
// pg Pool - Para queries SQL directas y consultas complejas optimizadas
exports.pool = new pg_1.Pool(poolConfig);
// Sequelize - Para operaciones CRUD, validaciones y relaciones
exports.sequelize = new sequelize_1.Sequelize({
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
});
// Manejo de errores del pool
exports.pool.on("error", (err, client) => {
    console.error("Unexpected error on idle client", err);
});
// SEGURIDAD: Siempre usa $1, $2, $3... con array de params para prevenir SQL injection
const query = (text, params, client) => __awaiter(void 0, void 0, void 0, function* () {
    const executor = client !== null && client !== void 0 ? client : exports.pool;
    const start = Date.now();
    try {
        const res = yield executor.query(text, params);
        if (process.env.NODE_ENV === "development") {
            console.log("Executed query", {
                text,
                rows: res.rowCount,
                tx: !!client,
            });
        }
        return res;
    }
    catch (error) {
        console.error("Database query error:", {
            text,
            error: error.message,
        });
        throw error;
    }
});
exports.query = query;
// Función para transacciones con pg Pool
const transaction = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield exports.pool.connect();
    try {
        yield client.query("BEGIN");
        const result = yield callback(client);
        yield client.query("COMMIT");
        return result;
    }
    catch (error) {
        yield client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
});
exports.transaction = transaction;
// Test de conexión para ambos sistemas
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test pg Pool
        const poolResult = yield (0, exports.query)("SELECT NOW() as now, version() as version");
        console.log("pg pool conectado exitosamente - pg Pool connected successfully");
        console.log("   Database version:", poolResult.rows[0].version.split(" ")[0]);
        // Test Sequelize
        yield exports.sequelize.authenticate();
        //Advertencia no tocar sync en producción, puede causar pérdida de datos.
        yield exports.sequelize.sync({ force: false });
        console.log("Sequelize conectado exitosamente - Sequelize connected successfully");
        return true;
    }
    catch (error) {
        console.error("conexion fallida con la base de datos - Database connection failed:", error);
        return false;
    }
});
exports.testConnection = testConnection;
const closeConnections = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.pool.end();
        yield exports.sequelize.close();
        console.log("Conexion de base de datos cerradas - Database connections closed");
    }
    catch (error) {
        console.error("Error al intentar la conexion la base de datos - Error closing database connections:", error);
    }
});
exports.closeConnections = closeConnections;
exports.default = exports.pool;
//# sourceMappingURL=database.js.map