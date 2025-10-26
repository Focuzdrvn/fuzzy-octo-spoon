const { verifyToken } = require("../utils/jwtUtils");

/**
 * Middleware to verify voter authentication
 */
const isVoter = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = verifyToken(token);

    // Check if role is Voter
    if (decoded.role !== "Voter") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Voter role required.",
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * Middleware to verify admin authentication
 */
const isAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = verifyToken(token);

    // Check if role is Admin
    if (decoded.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
      });
    }

    // Attach user info to request
    req.user = {
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { isVoter, isAdmin };
