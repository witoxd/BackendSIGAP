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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
const sequelize_models_1 = require("./models/sequelize/sequelize-models");
const database_2 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// CORS configuration
const allowedOrigins = ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",")) || ["http://localhost:4000"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Body parser
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Logging
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
else {
    app.use((0, morgan_1.default)("combined"));
}
// Rate limiting
app.use(rateLimiter_1.rateLimiter);
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API Routes
app.use("/api", routes_1.default);
// Error handlers
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("SIGTERM signal received: closing HTTP server");
    yield (0, database_1.closeConnections)();
    process.exit(0);
}));
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("SIGINT signal received: closing HTTP server");
    yield (0, database_1.closeConnections)();
    process.exit(0);
}));
// Start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, sequelize_models_1.initializeModels)();
        // Test database connection
        const dbConnected = yield (0, database_1.testConnection)();
        if (!dbConnected) {
            console.error("❌ Failed to connect to database. Server not started.");
            process.exit(1);
        }
        app.listen(PORT, () => {
            console.log(chalk_1.default.green(figlet_1.default.textSync("(SIGAP)", { horizontalLayout: "full" })));
            console.log(chalk_1.default.blueBright.bold(` Corriendo Server en http://${HOST}:${PORT}`));
            console.log(chalk_1.default.blueBright.bold(` Entorno: ${process.env.NODE_ENV || "development"}`));
            console.log(` API Routes: http://${HOST}:${PORT}/api`);
            console.log("Sincronizacion forzada con la DB: ", database_2.FORCE_DATABASE_SYNC);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map