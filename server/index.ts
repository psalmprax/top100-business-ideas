import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GO_BACKEND = process.env.GO_BACKEND_URL || "http://localhost:8080";
const PYTHON_BACKEND =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const staticPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

app.use(
  express.static(staticPath, {
    maxAge: "1d",
    etag: true,
    lastModified: true,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const mlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "ML resource limit exceeded" },
});

app.use("/api/", apiLimiter);

app.use(
  "/api/v1/ml",
  mlLimiter,
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/ml": "" },
  })
);

app.use(
  "/api/v1/deepfake",
  mlLimiter,
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/deepfake": "/deepfake" },
  })
);

app.use(
  "/api/v1/compliance",
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/compliance": "/compliance" },
  })
);

app.use(
  "/api/v1/governance",
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/governance": "/governance" },
  })
);

app.use(
  "/api/v1/enterprise",
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/enterprise": "/enterprise" },
  })
);

app.use(
  "/api/v1/venture",
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/venture": "/venture" },
  })
);

app.use(
  "/api/v1/alerts",
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/alerts": "/alerts" },
  })
);

app.use(
  "/api/v1/intelligence",
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/intelligence": "/intelligence" },
  })
);

app.use(
  "/api/v1/extended",
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/extended": "/extended" },
  })
);

app.use(
  "/api/v1/auth",
  createProxyMiddleware({
    target: GO_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/auth": "/api/v1/auth" },
  })
);

app.use(
  "/api/v1/agents",
  createProxyMiddleware({
    target: GO_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/agents": "/api/v1/agents" },
  })
);

app.use(
  "/api/v1/billing",
  createProxyMiddleware({
    target: GO_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/billing": "/api/v1/billing" },
  })
);

app.use(
  "/api/v1/workforce",
  createProxyMiddleware({
    target: GO_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/workforce": "/api/v1/workforce" },
  })
);

app.use(
  "/api/v1/webhooks",
  createProxyMiddleware({
    target: GO_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/webhooks": "/api/v1/webhooks" },
  })
);

app.use(
  "/api/v1/health",
  createProxyMiddleware({
    target: GO_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/health": "/api/v1/health" },
  })
);

app.use(
  "/ws",
  (req, _res, next) => {
    req.url = req.url.replace("/ws", "");
    next();
  },
  createProxyMiddleware({
    target: GO_BACKEND,
    changeOrigin: true,
    ws: true,
  })
);

io.on("connection", socket => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("subscribe", (channel: string) => {
    socket.join(channel);
    console.log(`Client ${socket.id} subscribed to ${channel}`);
  });

  socket.on("unsubscribe", (channel: string) => {
    socket.leave(channel);
    console.log(`Client ${socket.id} unsubscribed from ${channel}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.get("/api/status", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      go: GO_BACKEND,
      python: PYTHON_BACKEND,
    },
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         Top100 Business Ideas - Unified Server            ║
╠═══════════════════════════════════════════════════════════╣
║  HTTP:       http://localhost:${PORT}                        ║
║  Go Backend: ${GO_BACKEND}                   ║
║  Python/ML:  ${PYTHON_BACKEND}                  ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export { app, server, io };
