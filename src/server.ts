import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import serviceRoutes from "./routes/service.routes";
import slotRoutes from "./routes/slot.routes";
import appointmentRoutes from "./routes/appointment.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "10kb" }));

// Rate limiting on auth endpoints specifically - the routes most useful to brute-force
const authLimiter = rateLimit({
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

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] Running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

start();
