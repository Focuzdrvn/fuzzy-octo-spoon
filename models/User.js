const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    profilePicUrl: {
      type: String,
    },
    supabaseId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-traffic user lookups (2000+ concurrent users)
userSchema.index({ email: 1 }); // Unique index already set in schema
userSchema.index({ supabaseId: 1 }); // Unique index already set in schema

module.exports = mongoose.model("User", userSchema);
