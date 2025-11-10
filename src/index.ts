import express, { Application, Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import path from "path";

// Import routes
import participantRoutes from "@/routes/participant.routes";
import submissionRoutes from "@/routes/submission.routes";
import adminRoutes from "@/routes/admin.routes";
import judgeRoutes from "@/routes/judge.routes";
import notificationRoutes from "@/routes/notification.routes";
import uploadRoutes from "@/routes/upload";
import whatsappSimpleRoutes from "@/routes/whatsappSimple.routes";

// Import cron jobs
import { initializeCronJobs, stopCronJobs } from "@/utils/cron";
import { validateEnv } from "@/config/validateEnv";

// Import WhatsApp service for webhook
import whatsappService from "@/services/whatsapp.service";

// Validate required environment variables
validateEnv();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO for real-time updates
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

const io = new SocketServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Request logging middleware
app.use((req: Request, _res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Articon Hackathon API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// WhatsApp webhook verification (Meta requires GET endpoint)
app.get("/webhook/whatsapp", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"] as string;
  const token = req.query["hub.verify_token"] as string;
  const challenge = req.query["hub.challenge"] as string;

  const verificationResult = whatsappService.verifyWebhook(
    mode,
    token,
    challenge,
  );

  if (verificationResult) {
    res.status(200).send(verificationResult);
  } else {
    res.status(403).send("Verification failed");
  }
});

// WhatsApp webhook handler (Meta sends POST requests here)
app.post("/webhook/whatsapp", async (req: Request, res: Response) => {
  try {
    await whatsappService.handleWebhook(req.body);
    res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("Error handling WhatsApp webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});

// API Routes
app.use("/api/participants", participantRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/judge", judgeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/whatsapp-simple", whatsappSimpleRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-admin", () => {
    socket.join("admin-room");
    console.log("Admin joined:", socket.id);
  });

  socket.on("join-judge", (judgeId: string) => {
    socket.join(`judge-${judgeId}`);
    console.log(`Judge ${judgeId} joined:`, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Export io for use in controllers
export { io };

// Initialize cron jobs
if (process.env.NODE_ENV !== "test") {
  if (!process.env.CRON_BASE_URL && !process.env.API_URL) {
    console.warn('[Cron] Using inferred base URL from PORT. Set CRON_BASE_URL for production.');
  }
  initializeCronJobs();
}

// Start server
httpServer.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("Articon Hackathon API Server");
  console.log("=".repeat(50));
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Server running on port: ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log("=".repeat(50));
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("\nReceived shutdown signal. Closing server gracefully...");

  stopCronJobs();

  httpServer.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default app;
