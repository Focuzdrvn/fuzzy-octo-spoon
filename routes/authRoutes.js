const express = require("express");
const router = express.Router();
const { googleCallback, adminLogin } = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");

// POST /api/auth/google/callback - Google OAuth callback
router.post("/google/callback", authLimiter, googleCallback);

// POST /api/auth/admin/login - Admin login
router.post("/admin/login", authLimiter, adminLogin);

module.exports = router;
