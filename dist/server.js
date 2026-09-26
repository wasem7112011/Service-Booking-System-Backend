"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const slot_routes_1 = __importDefault(require("./routes/slot.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.env.corsOrigin, credentials: true }));
app.use(express_1.default.json({ limit: "10kb" }));
// Rate limiting on auth endpoints specifically - the routes most useful to brute-force
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts, please try again later." },
});
app.use("/api/auth", authLimiter);
app.get("/api/health", (_req, res) => {
    res.status(200).json({ success: true, data: { status: "ok" } });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/services", service_routes_1.default);
app.use("/api/slots", slot_routes_1.default);
app.use("/api/appointments", appointment_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
async function start() {
    await (0, db_1.connectDB)();
    app.listen(env_1.env.port, () => {
        console.log(`[server] Running on http://localhost:${env_1.env.port} (${env_1.env.nodeEnv})`);
    });
}
start();
