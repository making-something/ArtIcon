import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import path from "path";

// Import routes
import participantRoutes from "@/routes/participant.routes";
import submissionRoutes from "@/routes/submission.routes";
import adminRoutes from "@/routes/admin.routes";
import notificationRoutes from "@/routes/notification.routes";
import portfolioRoutes from "@/routes/portfolio.routes";
import migrationRunner from "@/config/migration-runner";

// Validate required environment variables

// Initialize database migrations
migrationRunner.runMigrations().catch((error) => {
	console.error("❌ Database migration failed:", error);
	process.exit(1);
});

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server
const httpServer = createServer(app);

// Normalize and collect allowed origins for CORS/Socket.IO
const normalizeOrigin = (origin: string) => origin.replace(/\/+$/, "");

const parseOrigins = (origins?: string) => {
	if (!origins) {
		return [];
	}

	return origins
		.split(/[\s,]+/)
		.map((origin) => normalizeOrigin(origin.trim()))
		.filter(Boolean);
};
//hellu

const managedOrigins = ["https://articon.multiicon.in"];

const defaultOrigins = ["http://localhost:3000", "http://localhost:8182"];

const envOrigins = parseOrigins(process.env.FRONTEND_URL);

const allowedOrigins = Array.from(
	new Set([...envOrigins, ...managedOrigins, ...defaultOrigins])
);

if (process.env.NODE_ENV !== "test") {
	if (envOrigins.length === 0) {
		console.warn(
			"No FRONTEND_URL configured; only localhost origins will be allowed."
		);
	} else {
		console.log(
			`CORS allowed origins: ${allowedOrigins
				.map((origin) => origin || "(empty)")
				.join(", ")}`
		);
	}
}

const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		if (!origin) {
			return callback(null, true);
		}

		const sanitizedOrigin = normalizeOrigin(origin);

		if (allowedOrigins.includes(sanitizedOrigin)) {
			return callback(null, true);
		}

		return callback(new Error(`Origin ${origin} not allowed by CORS`));
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

const io = new SocketServer(httpServer, {
	cors: {
		origin: allowedOrigins,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		credentials: true,
	},
});

// Middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

// API Routes
app.use("/api/participants", participantRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/portfolio", portfolioRoutes);

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

	socket.on("disconnect", () => {
		console.log("Client disconnected:", socket.id);
	});
});

// Export io for use in controllers
export { io };

// Start server
httpServer
	.listen(PORT, () => {
		console.log("=".repeat(50));
		console.log("Articon Hackathon API Server");
		console.log("=".repeat(50));
		console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
		console.log(`Server running on port: ${PORT}`);
		console.log(`API URL: http://localhost:${PORT}`);
		console.log(`Health check: http://localhost:${PORT}/health`);
		console.log("=".repeat(50));
	})
	.on("error", (err: NodeJS.ErrnoException) => {
		if (err.code === "EADDRINUSE") {
			console.error(`\n❌ Error: Port ${PORT} is already in use.`);
			console.error(`\nTo fix this, run one of the following commands:`);
			console.error(`  1. Kill the process: lsof -ti:${PORT} | xargs kill -9`);
			console.error(
				`  2. Or use a different port by setting PORT environment variable\n`
			);
			process.exit(1);
		} else {
			console.error("Server error:", err);
			process.exit(1);
		}
	});

// Graceful shutdown
const gracefulShutdown = () => {
	console.log("\nReceived shutdown signal. Closing server gracefully...");

	httpServer.close(() => {
		console.log("HTTP server closed");
		process.exit(0);
	});

	// Force close after 10 seconds
	setTimeout(() => {
		console.error(
			"Could not close connections in time, forcefully shutting down"
		);
		process.exit(1);
	}, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default app;
