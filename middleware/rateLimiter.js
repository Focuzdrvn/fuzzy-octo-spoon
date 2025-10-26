const rateLimit = require("express-rate-limit");

// Rate limiter for authentication endpoints (20 requests per 15 minutes) - Increased for high traffic
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window (increased from 5)
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// Rate limiter for voting endpoint (20 requests per hour) - Increased for high traffic
const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per window (increased from 10)
  message: {
    success: false,
    message: "Too many voting attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// General rate limiter for other endpoints (500 requests per 15 minutes) - Significantly increased for 2000+ users
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window (increased from 100)
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

module.exports = { authLimiter, voteLimiter, generalLimiter };
