const bcrypt = require("bcryptjs");
const User = require("../models/User");
const VoterRoll = require("../models/VoterRoll");
const { verifySupabaseToken } = require("../config/supabase");
const { generateToken } = require("../utils/jwtUtils");
const {
  validateGoogleCallback,
  validateAdminLogin,
} = require("../utils/validators");

/**
 * Handle Google OAuth callback
 * POST /api/auth/google/callback
 */
const googleCallback = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = validateGoogleCallback(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { supabaseToken } = req.body;

    // Verify Supabase JWT
    const supabaseUser = await verifySupabaseToken(supabaseToken);

    // Extract user data
    const email = supabaseUser.email;
    const name =
      supabaseUser.user_metadata?.name || supabaseUser.email.split("@")[0];
    const profilePicUrl = supabaseUser.user_metadata?.avatar_url || "";
    const supabaseId = supabaseUser.id;

    // VOTER ROLL CHECK (Optional)
    // Set REQUIRE_VOTER_ROLL=false in .env to allow open voting
    const requireVoterRoll = process.env.REQUIRE_VOTER_ROLL !== "false";

    if (requireVoterRoll) {
      // CRITICAL CHECK: Verify user is in VoterRoll
      const voterRollEntry = await VoterRoll.findOne({
        email: email.toLowerCase(),
      });

      if (!voterRollEntry) {
        return res.status(403).json({
          success: false,
          message: "You are not an eligible voter for this election.",
        });
      }
    }

    // Find or create User document
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name,
        profilePicUrl,
        supabaseId,
      });
    } else {
      // Update user info if changed
      user.name = name;
      user.profilePicUrl = profilePicUrl;
      await user.save();
    }

    // Generate system JWT
    const token = generateToken({
      userId: user._id,
      role: "Voter",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profilePicUrl: user.profilePicUrl,
        role: "Voter",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle admin login
 * POST /api/auth/admin/login
 */
const adminLogin = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = validateAdminLogin(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { username, password } = req.body;

    // Check username
    if (username !== process.env.ADMIN_USER) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      process.env.ADMIN_HASH
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate system JWT
    const token = generateToken({
      role: "Admin",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        username,
        role: "Admin",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { googleCallback, adminLogin };
