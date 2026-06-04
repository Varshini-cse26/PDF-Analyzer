import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { AppConfig } from "./server/config/app.config";
import { analysisController } from "./server/controller/analysis.controller";

async function startServer() {
  const app = express();

  // Parse JSON bodies of incoming requests
  app.use(express.json());

  // Security headers setup (basic helmet-like custom configuration)
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  // REST API Route
  app.post("/api/analyze", (req, res) => {
    analysisController.analyze(req, res);
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "PDF Analyzer Backend"
    });
  });

  // Vite Integration for Full-Stack routing
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static frontend assets
    app.use(express.static(distPath));
    
    // SPA fallback route
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(AppConfig.PORT, AppConfig.HOST, () => {
    console.log(`[PDF Analyzer] Running on http://${AppConfig.HOST}:${AppConfig.PORT}`);
  });
}

// Global exception shielding
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandle Rejection at promise:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Server Exception:", error);
});

startServer();
