const jwt = require("jsonwebtoken");

/**
 * Generate JWT token
 * @param {object} payload - Data to encode in token
 * @returns {string} - Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = { generateToken, verifyToken };
