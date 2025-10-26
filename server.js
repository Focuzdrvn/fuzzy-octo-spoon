require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");

// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const voteRoutes = require("./routes/voteRoutes");
const resultsRoutes = require("./routes/resultsRoutes");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Compression middleware for all responses (improves performance for high traffic)
app.use(
  compression({
    level: 6, // Compression level (0-9, higher = more compression but slower)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false; // Don't compress if client sends this header
      }
      return compression.filter(req, res);
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parser middleware - Increased limits for high traffic
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 100000 })
);

// Increase max connections and timeouts for high traffic
app.set("trust proxy", 1);

// Keep-alive timeout (slightly longer than load balancer)
if (app.server) {
  app.server.keepAliveTimeout = 65000; // 65 seconds
  app.server.headersTimeout = 66000; // 66 seconds
}

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Cell Voting API is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", voteRoutes);
app.use("/api/results", resultsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

module.exports = app;
