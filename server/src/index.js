import "dotenv/config";
import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { prisma } from "./db.js";
import { attachChatSockets } from "./sockets.js";
import { authRouter } from "./routes/auth.js";
import { contactRouter } from "./routes/contacts.js";
import { chatRouter } from "./routes/chats.js";
import { authenticateSocket } from "./auth.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters.");
}

const app = express();
const httpServer = createServer(app);
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
});
app.set("io", io);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }), authRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/chats", chatRouter);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use((_req, res) => res.status(404).json({ error: "Route not found." }));
app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);
  console.error("API request failed", error);
  return res.status(500).json({ error: "The request could not be completed." });
});

io.use(authenticateSocket);
attachChatSockets(io);

const port = Number(process.env.PORT ?? 4000);
httpServer.listen(port, () => {
  console.log(`Blinker-a API listening on http://localhost:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await prisma.$disconnect();
    httpServer.close(() => process.exit(0));
  });
}
