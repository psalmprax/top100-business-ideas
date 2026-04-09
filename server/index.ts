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

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

const GO_BACKEND = process.env.GO_BACKEND_URL || "http://localhost:8080";
const PYTHON_BACKEND =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set.");
  process.exit(1);
}

const ADMIN_SECRET = process.env.ADMIN_SECRET;
if (!ADMIN_SECRET) {
  console.error("FATAL: ADMIN_SECRET environment variable is not set.");
  process.exit(1);
}

const app = express();
const server = createServer(app);

// Global System Lock State
let IS_SYSTEM_LOCKED = false;

const io = new SocketServer(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? (process.env.CORS_ORIGIN || "http://149.104.110.122") 
      : "*",
    methods: ["GET", "POST"],
  },
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://api.placeholder.com"],
        connectSrc: ["'self'", "ws:", "wss:", "http://localhost:7001", "http://localhost:8080", "http://localhost:8000"],
      },
    },
  })
);
app.use(compression());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? (process.env.CORS_ORIGIN || "http://149.104.110.122") 
      : "*",
    credentials: true,
  })
);

// GLOBAL LOCK MIDDLEWARE
const lockMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (IS_SYSTEM_LOCKED && !req.path.includes("/api/v1/auth") && !req.path.includes("/api/status") && !req.path.includes("/api/v1/panic/reset")) {
    return res.status(503).json({ 
      error: "System Lock Active", 
      message: "The AlphaAI infrastructure is currently under defensive lockdown. All agentic operations are suspended." 
    });
  }
  next();
};

// JWT VALIDATION MIDDLEWARE
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Allow health checks and auth routes (login/register)
  if (req.originalUrl.includes("/api/status") || req.originalUrl.includes("/api/v1/auth")) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("[Proxy Auth] Invalid token:", err);
    return res.status(401).json({ error: "Invalid or expired session" });
  }
};

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Apply security middlewares
app.use(lockMiddleware);
app.use("/api/v1", authMiddleware);

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
  "/api/v1/agent-ops",
  createProxyMiddleware({
    target: GO_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/agent-ops": "/api/v1/agent-ops" },
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
    locked: IS_SYSTEM_LOCKED,
    services: {
      go: GO_BACKEND,
      python: PYTHON_BACKEND,
    },
  });
});

// PANIC WORD / GLOBAL LOCK ENDPOINTS
app.post("/api/v1/panic", (req, res) => {
  const { reason } = req.body;
  console.warn(`[SECURITY] Panic Word Triggered! Reason: ${reason || "Unspecified"}`);
  IS_SYSTEM_LOCKED = true;
  
  // Emit security alert via Socket.io
  io.emit("security_alert", {
    type: "GLOBAL_LOCK",
    timestamp: new Date().toISOString(),
    message: "Global security lockdown initiated via Panic Word protocol."
  });

  res.json({ 
    success: true, 
    message: "Global System Lock engaged. All agentic operations suspended." 
  });
});

app.post("/api/v1/panic/reset", (req, res) => {
  const { adminSecret } = req.body;
  
  // Use environment secret ONLY
  const validSecret = ADMIN_SECRET;
  
  if (adminSecret !== validSecret) {
    console.warn(`[SECURITY] Unauthorized reset attempt from IP: ${req.ip}`);
    return res.status(403).json({ error: "Unauthorized reset attempt" });
  }

  console.info("[SECURITY] Global System Lock released by administrator.");
  IS_SYSTEM_LOCKED = false;
  
  io.emit("security_alert", {
    type: "LOCK_RELEASED",
    timestamp: new Date().toISOString(),
    message: "Security lockdown released. Normal operations resumed."
  });

  res.json({ success: true, message: "System lock released." });
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
